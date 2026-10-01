import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InfrastructureInventoryEngine,
  DomainDnsEngine,
  TlsSecurityEngine,
  SecurityHeadersEngine,
  ContainerHardeningEngine,
  NetworkFirewallEngine,
  DatabaseHardeningEngine,
  CiCdPipelineEngine,
  DeploymentRollbackEngine,
  InfrastructureFailureSimulator,
} from './infrastructure-core.mjs';

@Injectable()
export class InfrastructureService {
  private readonly logger = new Logger(InfrastructureService.name);

  constructor(private readonly configService: ConfigService) {}

  getInfrastructureInventory() {
    return InfrastructureInventoryEngine.getInventory();
  }

  getDomainDnsRecords(domain = 'washora.com') {
    return DomainDnsEngine.getAuthoritativeDnsRecords(domain);
  }

  validateDns(records: any[]) {
    return DomainDnsEngine.validateDnsConfiguration(records);
  }

  getTlsEngine() {
    return TlsSecurityEngine;
  }

  getSecurityHeadersEngine() {
    return SecurityHeadersEngine;
  }

  getContainerHardeningEngine() {
    return ContainerHardeningEngine;
  }

  getNetworkFirewallEngine() {
    return NetworkFirewallEngine;
  }

  getDatabaseHardeningEngine() {
    return DatabaseHardeningEngine;
  }

  getCiCdEngine() {
    return CiCdPipelineEngine;
  }

  getRollbackEngine() {
    return DeploymentRollbackEngine;
  }

  getFailureSimulator() {
    return InfrastructureFailureSimulator;
  }
}
