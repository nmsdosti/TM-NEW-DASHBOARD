import React from 'react';
import { TMIndustrialLogo } from './TMIndustrialLogo';
import { NotificationCenter } from './NotificationCenter';
import { Button } from '@/components/ui/button';
import { AppNotification } from '@/types/vibration';
import {
  LayoutDashboard,
  Cpu,
  FileText,
  MapPin,
  CheckCircle2,
  Download,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'machines';

interface HeaderNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  siteName?: string;
  notifications: AppNotification[];
  onSelectEquipment?: (equipmentName: string) => void;
  onOpenReport?: () => void;
  lastUpdatedTime?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  siteName = 'Shree Durga Syntex',
  notifications,
  onSelectEquipment,
  onOpenReport,
  lastUpdatedTime,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Equipment Vibration Matrix', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: TM Industrial Solution Branding + Site Location */}
          <div className="flex items-center gap-3 sm:gap-6">
            <TMIndustrialLogo />

            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>{siteName}</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs (Dashboard & Equipment Matrix) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Auto-Sync status + Report Download + Notification Bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto Sync Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Auto-Sync Active</span>
              {lastUpdatedTime && (
                <span className="text-emerald-700 font-normal">({lastUpdatedTime})</span>
              )}
            </div>

            {/* Download Report Button */}
            {onOpenReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenReport}
                className="h-9 px-3 text-xs font-bold border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 shadow-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                <span>Download Report</span>
              </Button>
            )}

            {/* Notification Bell */}
            <NotificationCenter
              notifications={notifications}
              onSelectEquipment={onSelectEquipment}
            />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-slate-200 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
