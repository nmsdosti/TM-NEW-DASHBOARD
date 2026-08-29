import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info, Gauge, Zap, Check, AlertTriangle, AlertOctagon } from 'lucide-react';

export const IsoGuidelineCard: React.FC = () => {
  return (
    <Card className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">ISO 10816-3 Standard Severity Guide</CardTitle>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 bg-muted rounded border border-border/40">
            Class II Machines (15kW - 300kW)
          </span>
        </div>
        <CardDescription className="text-xs">
          Industrial vibration velocity severity thresholds (RMS mm/s) & bearing acceleration limits
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          {/* Zone A: Good */}
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Zone A
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                Good
              </span>
            </div>
            <div className="text-sm font-black text-foreground">&lt; 1.40 mm/s</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Newly commissioned / ideal baseline condition.
            </p>
          </div>

          {/* Zone B: Satisfactory / Normal */}
          <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-500 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Zone B
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-500/20 px-1.5 py-0.2 rounded">
                Normal
              </span>
            </div>
            <div className="text-sm font-black text-foreground">1.40 - 2.80 mm/s</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Acceptable for long-term continuous operation.
            </p>
          </div>

          {/* Zone C: Alert / Unsatisfactory */}
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Zone C
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-500/20 px-1.5 py-0.2 rounded">
                Alert
              </span>
            </div>
            <div className="text-sm font-black text-foreground">2.80 - 4.50 mm/s</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Degraded state. Schedule maintenance inspection.
            </p>
          </div>

          {/* Zone D: Alarm / Unacceptable */}
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5" /> Zone D
              </span>
              <span className="text-[10px] uppercase font-bold text-destructive bg-destructive/20 px-1.5 py-0.2 rounded">
                Alarm
              </span>
            </div>
            <div className="text-sm font-black text-foreground">&gt; 4.50 mm/s (or &gt; 5g)</div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Severe defect. Immediate corrective action required.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
