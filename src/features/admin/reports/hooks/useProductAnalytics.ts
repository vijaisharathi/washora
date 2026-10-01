"use client";

import { useState, useEffect, useCallback } from "react";
import {
  productAnalyticsService,
  FunnelReportData,
  ExperimentData,
  ImprovementData,
  DataQualityAuditData,
} from "@/services/analytics/productAnalyticsService";

export function useFunnelAnalytics() {
  const [data, setData] = useState<FunnelReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAnalyticsService.getFunnelReport();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load funnel analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFunnel();
  }, [fetchFunnel]);

  return { data, loading, error, refetch: fetchFunnel };
}

export function useExperiments() {
  const [data, setData] = useState<ExperimentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAnalyticsService.getExperiments();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load experiments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExperiments();
  }, [fetchExperiments]);

  return { data, loading, error, refetch: fetchExperiments };
}

export function useProductImprovements() {
  const [data, setData] = useState<ImprovementData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImprovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAnalyticsService.getImprovements();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load product improvements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchImprovements();
  }, [fetchImprovements]);

  return { data, loading, error, refetch: fetchImprovements };
}

export function useDataQualityAudit() {
  const [data, setData] = useState<DataQualityAuditData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productAnalyticsService.getDataQualityAudit();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load data quality audit.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAudit();
  }, [fetchAudit]);

  return { data, loading, error, refetch: fetchAudit };
}
