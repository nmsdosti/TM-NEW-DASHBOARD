import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, colorClass = 'text-primary' }: StatsCardProps) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-[0_0_30px_hsl(200_100%_45%_/_0.2)] transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-card/80 animate-scale-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500 -mr-16 -mt-16" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {value}
            </p>
            {trend && (
              <p className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="relative">
            <div className={`absolute inset-0 rounded-xl blur-xl opacity-50 ${colorClass.replace('text-', 'bg-')}/30 group-hover:opacity-75 transition-opacity duration-300`} />
            <div className={`relative rounded-xl bg-gradient-to-br from-${colorClass.replace('text-', '')}/20 to-${colorClass.replace('text-', '')}/10 p-3.5 backdrop-blur-sm border border-${colorClass.replace('text-', '')}/20`}>
              <Icon className={`h-7 w-7 ${colorClass} drop-shadow-[0_0_8px_currentColor]`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
