import React from "react";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
  description?: string;
}

interface FunnelChartProps {
  title: string;
  subtitle?: string;
  stages: FunnelStage[];
}

export function FunnelChart({ title, subtitle, stages }: FunnelChartProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center h-[280px]">
        <p className="text-xs font-semibold text-on-surface">No funnel data</p>
      </div>
    );
  }

  const baseCount = stages[0]?.count || 1;

  return (
    <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
        {subtitle && (
          <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const widthPct = Math.min(Math.max((stage.count / baseCount) * 100, 15), 100);
          const stageColors = [
            "bg-primary",
            "bg-blue-500",
            "bg-indigo-500",
            "bg-emerald-500",
          ];
          const color = stageColors[idx % stageColors.length];

          return (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-on-surface">
                    {stage.stage}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {stage.dropoffRate !== undefined && stage.dropoffRate > 0 && (
                    <span className="text-[11px] text-rose-500 font-medium">
                      -{stage.dropoffRate}% drop
                    </span>
                  )}
                  <span className="font-bold font-mono text-on-surface">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              {stage.description && (
                <p className="text-[11px] text-on-surface-variant pl-7">
                  {stage.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
