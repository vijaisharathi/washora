export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownPeriodMs?: number;
  successThreshold?: number;
  name?: string;
}

export class CircuitBreakerOpenException extends Error {
  constructor(name: string = 'Service') {
    super(`Circuit breaker for ${name} is OPEN. Fast-failing execution.`);
    this.name = 'CircuitBreakerOpenException';
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private lastStateChange: Date = new Date();

  private readonly failureThreshold: number;
  private readonly cooldownPeriodMs: number;
  private readonly successThreshold: number;
  private readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.cooldownPeriodMs = options.cooldownPeriodMs ?? 10000;
    this.successThreshold = options.successThreshold ?? 2;
    this.name = options.name ?? 'CircuitBreaker';
  }

  getState(): CircuitState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.cooldownPeriodMs) {
        this.transitionTo('HALF_OPEN');
      }
    }
    return this.state;
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = new Date();
    if (newState === 'HALF_OPEN') {
      this.successCount = 0;
    } else if (newState === 'CLOSED') {
      this.failureCount = 0;
      this.successCount = 0;
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      throw new CircuitBreakerOpenException(this.name);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= this.successThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      this.failureCount += 1;
      if (this.failureCount >= this.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  reset(): void {
    this.transitionTo('CLOSED');
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange,
    };
  }
}
