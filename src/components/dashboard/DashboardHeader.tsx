import { Activity, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  siteName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DashboardHeader = ({ siteName, onRefresh, isRefreshing }: DashboardHeaderProps) => {
  return (
    <header className="relative border-b border-primary/20 bg-gradient-to-r from-card via-card/95 to-card overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(200_100%_45%_/_0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(200_100%_45%_/_0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container mx-auto px-6 py-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/30 transition-all duration-300 animate-glow-pulse" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Activity className="h-7 w-7 text-primary-foreground animate-pulse" />
                <Zap className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-bounce" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in">
                Condition Monitoring Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse" />
                Site: <span className="font-semibold text-foreground">{siteName || 'Vinati Organics Limited'}</span>
              </p>
            </div>
          </div>

          {onRefresh && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Sync Sheet'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

