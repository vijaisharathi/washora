/**
 * ============================================================================
 * WASHORA PHASE T5 — OBSERVABILITY & INCIDENT RESPONSE NESTJS SERVICES
 * ============================================================================
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  TelemetryEngine,
  RequestTracerEngine,
  DatabaseMonitorEngine,
  CacheMonitorEngine,
  QueueMonitorEngine,
  PaymentMonitorEngine,
  SecurityMonitorEngine,
  FrontendMonitorEngine,
  DeploymentMonitorEngine,
  BusinessHealthEngine,
  AlertManagerEngine,
  IncidentManagerEngine,
  RCAEngine,
  SLOEngine,
  DashboardEngine,
} from './observability-core.mjs';

import {
  AlertSeverity,
  IncidentStage,
  TraceContext,
  FiveWhysReport,
} from './observability.types';

@Injectable()
export class TelemetryService extends TelemetryEngine {
  private readonly logger = new Logger(TelemetryService.name);
}

@Injectable()
export class RequestTracerService extends RequestTracerEngine {
  private readonly logger = new Logger(RequestTracerService.name);
}

@Injectable()
export class DatabaseMonitorService extends DatabaseMonitorEngine {
  private readonly logger = new Logger(DatabaseMonitorService.name);
}

@Injectable()
export class CacheMonitorService extends CacheMonitorEngine {
  private readonly logger = new Logger(CacheMonitorService.name);
}

@Injectable()
export class QueueMonitorService extends QueueMonitorEngine {
  private readonly logger = new Logger(QueueMonitorService.name);
}

@Injectable()
export class PaymentMonitorService extends PaymentMonitorEngine {
  private readonly logger = new Logger(PaymentMonitorService.name);
}

@Injectable()
export class SecurityMonitorService extends SecurityMonitorEngine {
  private readonly logger = new Logger(SecurityMonitorService.name);
}

@Injectable()
export class FrontendMonitorService extends FrontendMonitorEngine {
  private readonly logger = new Logger(FrontendMonitorService.name);
}

@Injectable()
export class DeploymentMonitorService extends DeploymentMonitorEngine {
  private readonly logger = new Logger(DeploymentMonitorService.name);
}

@Injectable()
export class BusinessHealthService extends BusinessHealthEngine {
  private readonly logger = new Logger(BusinessHealthService.name);
}

@Injectable()
export class AlertManagerService extends AlertManagerEngine {
  private readonly logger = new Logger(AlertManagerService.name);
}

@Injectable()
export class IncidentManagerService extends IncidentManagerEngine {
  private readonly logger = new Logger(IncidentManagerService.name);
}

@Injectable()
export class RCAEngineService extends RCAEngine {
  private readonly logger = new Logger(RCAEngineService.name);
}

@Injectable()
export class SLOManagerService extends SLOEngine {
  private readonly logger = new Logger(SLOManagerService.name);
}

@Injectable()
export class DashboardService {
  private engine: DashboardEngine;

  constructor(
    telemetry: TelemetryService,
    db: DatabaseMonitorService,
    cache: CacheMonitorService,
    queue: QueueMonitorService,
    payment: PaymentMonitorService,
    frontend: FrontendMonitorService,
    business: BusinessHealthService,
    alerts: AlertManagerService,
    slo: SLOManagerService,
  ) {
    this.engine = new DashboardEngine({
      telemetry,
      db,
      cache,
      queue,
      payment,
      frontend,
      business,
      alerts,
      slo,
    });
  }

  getDashboards() {
    return this.engine.getCoreDashboards();
  }
}
