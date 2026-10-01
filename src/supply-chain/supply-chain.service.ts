import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DependencyInventoryEngine,
  LockfileIntegrityEngine,
  VulnerabilityTriageEngine,
  FrameworkCompatibilityEngine,
  PrismaMigrationEngine,
  FinancialDataSafetyEngine,
  TenantIsolationSafetyEngine,
  SbomGeneratorEngine,
  LicenseComplianceEngine,
  SecretScanningEngine,
  ReleaseProvenanceEngine
} from './supply-chain-core.mjs';

@Injectable()
export class SupplyChainService {
  private readonly logger = new Logger(SupplyChainService.name);

  constructor(private readonly configService: ConfigService) {}

  getDependencyInventory() {
    const engine = new DependencyInventoryEngine();
    return engine.getInventory();
  }

  auditUnusedDependencies() {
    const engine = new DependencyInventoryEngine();
    return engine.auditUnusedAndObsolete();
  }

  validateLockfileIntegrity() {
    const engine = new LockfileIntegrityEngine();
    return engine.validateIntegrity();
  }

  triageVulnerabilities() {
    const engine = new VulnerabilityTriageEngine();
    return engine.triageAdvisories();
  }

  auditFrameworkCompatibility() {
    const engine = new FrameworkCompatibilityEngine();
    return engine.auditCompatibility();
  }

  getMigrationInventory() {
    const engine = new PrismaMigrationEngine();
    return engine.getMigrationInventory();
  }

  classifyMigrationSafety(sqlContent: string) {
    const engine = new PrismaMigrationEngine();
    return engine.classifyMigrationSafety(sqlContent);
  }

  verifyFinancialDataSafety(transactions: any[]) {
    const engine = new FinancialDataSafetyEngine();
    return engine.verifyFinancialInvariants(transactions);
  }

  verifyTenantIsolation(dataset: any[]) {
    const engine = new TenantIsolationSafetyEngine();
    return engine.verifyTenantBoundaries(dataset);
  }

  generateSbom(format: 'cyclonedx' | 'spdx' = 'cyclonedx') {
    const engine = new SbomGeneratorEngine();
    if (format === 'spdx') {
      return engine.generateSpdxJson();
    }
    return engine.generateCycloneDxJson();
  }

  auditLicenses() {
    const engine = new LicenseComplianceEngine();
    return engine.auditLicenses();
  }

  scanSecrets() {
    const engine = new SecretScanningEngine();
    return {
      workingTree: engine.scanWorkingTree(),
      gitHistory: engine.scanGitHistory()
    };
  }

  generateReleaseProvenance() {
    const engine = new ReleaseProvenanceEngine();
    return engine.generateManifest();
  }
}
