import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IntegrationInventoryEngine,
  IntegrationMatrixEngine,
  EnvironmentAuditorEngine,
  SecretManagerVerifierEngine,
  PaymentVerificationEngine,
  WebhookVerificationEngine,
  PaymentReconciliationEngine,
  CommunicationsVerificationEngine,
  StorageVerificationEngine,
  MapsVerificationEngine,
  ResilienceVerificationEngine,
  WorkflowSimulatorEngine,
} from './integration-core.mjs';

@Injectable()
export class IntegrationVerifierService {
  private readonly logger = new Logger(IntegrationVerifierService.name);

  constructor(private readonly configService: ConfigService) {}

  getIntegrationInventory() {
    return IntegrationInventoryEngine.getInventory();
  }

  evaluateIntegrationMatrix() {
    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');
    const allowMock = this.configService.get<boolean>('integrations.allowMockProviders', false);
    return IntegrationMatrixEngine.evaluateMatrix({ nodeEnv, allowMockProviders: allowMock });
  }

  auditEnvironment() {
    return EnvironmentAuditorEngine.auditEnvironment(process.env);
  }

  verifySecretManagement(plaintext: string, key1: string, key2: string) {
    return SecretManagerVerifierEngine.verifyKeyRotation(plaintext, key1, key2);
  }

  getPaymentEngine() {
    return new PaymentVerificationEngine();
  }

  getWebhookEngine() {
    return new WebhookVerificationEngine();
  }

  getReconciliationEngine() {
    return PaymentReconciliationEngine;
  }

  getCommunicationsEngine() {
    return CommunicationsVerificationEngine;
  }

  getStorageEngine() {
    return StorageVerificationEngine;
  }

  getMapsEngine() {
    return MapsVerificationEngine;
  }

  getResilienceEngine() {
    return ResilienceVerificationEngine;
  }

  getWorkflowSimulator() {
    return WorkflowSimulatorEngine;
  }
}
