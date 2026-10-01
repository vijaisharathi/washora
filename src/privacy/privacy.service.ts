import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DataInventoryEngine,
  DataClassificationEngine,
  DataFlowMappingEngine,
  PurposeLimitationEngine,
  AccessControlIsolationEngine,
  PaymentBoundaryEngine,
  LogTraceSanitizerEngine,
  ThirdPartySharingEngine,
  RetentionAndDeletionEngine,
  PrivacyIncidentEngine,
  DataClassification,
  RetentionCategory
} from './privacy-core.mjs';

@Injectable()
export class PrivacyService {
  private readonly logger = new Logger(PrivacyService.name);

  constructor(private readonly configService: ConfigService) {}

  getDataInventory() {
    const engine = new DataInventoryEngine();
    return engine.getInventory();
  }

  getDataInventorySummary() {
    const engine = new DataInventoryEngine();
    return engine.getSummary();
  }

  getDataClassificationTiers() {
    const engine = new DataClassificationEngine();
    return engine.getTiers();
  }

  classifyField(fieldName: string, context?: string) {
    const engine = new DataClassificationEngine();
    return engine.classifyField(fieldName, context);
  }

  getDataFlows() {
    const engine = new DataFlowMappingEngine();
    return engine.getFlows();
  }

  getPurposeMappings() {
    const engine = new PurposeLimitationEngine();
    return engine.getPurposeMappings();
  }

  validateFieldPurpose(fieldName: string) {
    const engine = new PurposeLimitationEngine();
    return engine.validateFieldPurpose(fieldName);
  }

  verifyCustomerIsolation(requestingUserId: string, targetUserId: string): boolean {
    const engine = new AccessControlIsolationEngine();
    return engine.verifyCustomerAccess(requestingUserId, targetUserId);
  }

  verifyTenantIsolation(requestingOrgId: string, targetOrgId: string): boolean {
    const engine = new AccessControlIsolationEngine();
    return engine.verifyTenantAccess(requestingOrgId, targetOrgId);
  }

  sanitizeCustomerForProvider(customer: any) {
    const engine = new AccessControlIsolationEngine();
    return engine.sanitizeCustomerForProvider(customer);
  }

  sanitizeCustomerForDelivery(customer: any, bookingAddress: any) {
    const engine = new AccessControlIsolationEngine();
    return engine.sanitizeCustomerForDelivery(customer, bookingAddress);
  }

  verifyPaymentBoundary(record: Record<string, any>) {
    const engine = new PaymentBoundaryEngine();
    return engine.isPciCompliantBoundary(record);
  }

  sanitizePaymentMetadata(rawGatewayResponse: any) {
    const engine = new PaymentBoundaryEngine();
    return engine.sanitizePaymentMetadata(rawGatewayResponse);
  }

  sanitizeLogText(text: string): string {
    const engine = new LogTraceSanitizerEngine();
    return engine.sanitizeText(text);
  }

  sanitizeLogObject(obj: any): any {
    const engine = new LogTraceSanitizerEngine();
    return engine.sanitizeObject(obj);
  }

  getThirdPartyProcessors() {
    const engine = new ThirdPartySharingEngine();
    return engine.getProcessors();
  }

  getRetentionMatrix() {
    const engine = new RetentionAndDeletionEngine();
    return engine.getRetentionMatrix();
  }

  generateUserDataExport(user: any, customer: any, addresses: any[], bookings: any[], reviews: any[], tickets: any[]) {
    const engine = new RetentionAndDeletionEngine();
    return engine.generateUserDataExport(user, customer, addresses, bookings, reviews, tickets);
  }

  anonymizeUserAccount(user: any) {
    const engine = new RetentionAndDeletionEngine();
    return engine.anonymizeUserAccount(user);
  }

  getIncidentWorkflow() {
    const engine = new PrivacyIncidentEngine();
    return engine.getWorkflow();
  }

  calculateIncidentSeverity(params: {
    sensitiveDataExposed: boolean;
    credentialsLeaked: boolean;
    affectedUsersCount: number;
    exposureDurationHours: number;
  }) {
    const engine = new PrivacyIncidentEngine();
    return engine.calculateSeverity(params);
  }
}
export { DataClassification, RetentionCategory };
