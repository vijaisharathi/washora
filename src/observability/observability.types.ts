/**
 * ============================================================================
 * WASHORA PHASE T5 — OBSERVABILITY & INCIDENT RESPONSE TYPES
 * ============================================================================
 */

export type AlertSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type IncidentStage =
  | 'DETECTED'
  | 'TRIAGED'
  | 'INVESTIGATING'
  | 'MITIGATING'
  | 'RECOVERING'
  | 'RESOLVED'
  | 'REVIEWED';

export interface TraceSpan {
  spanId: string;
  traceId: string;
  parentSpanId: string | null;
  name: string;
  durationMs?: number;
  tags?: Record<string, any>;
  status: 'OPEN' | 'OK' | 'ERROR';
  error?: { message: string; stack?: string };
}

export interface TraceContext {
  requestId: string;
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  timestamp: number;
  baggage?: Record<string, any>;
}

export interface AlertDefinition {
  alertId: string;
  fingerprint: string;
  title: string;
  severity: AlertSeverity;
  service: string;
  metric: string;
  currentValue: string | number;
  threshold: string | number;
  timestamp: string;
  runbookUrl: string;
  suggestedAction: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface IncidentRecord {
  incidentId: string;
  title: string;
  severity: AlertSeverity;
  status: IncidentStage;
  affectedServices: string[];
  symptoms: string;
  owner: string;
  timeline: Array<{ stage: IncidentStage; timestamp: string; note: string }>;
  rootCause?: string | null;
  mttdSeconds?: number;
  mttrSeconds?: number | null;
}

export interface FiveWhysReport {
  incidentId: string;
  timestamp: string;
  symptom: string;
  trigger: string;
  whys: Array<{ level: number; question: string; answer: string }>;
  rootCause: string;
  correctiveActions: Array<{ id: string; action: string; ownerRole: string; status: string }>;
}
