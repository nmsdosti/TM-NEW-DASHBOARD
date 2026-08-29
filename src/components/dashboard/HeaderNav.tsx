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
  ShieldAlert,
  Download,
  PhoneCall,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'machines';

interface HeaderNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  siteName?: string;
  notifications: AppNotification[];
  onSelectEquipment?: (equipmentName: string) => void;
  onOpenReport?: () => void;
  onOpenContact?: () => void;
  lastUpdatedTime?: string;
  onScrollToBadActors?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  siteName = 'Shree Durga Syntex',
  notifications,
  onSelectEquipment,
  onOpenReport,
  onOpenContact,
  lastUpdatedTime,
  onScrollToBadActors,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Equipment Matrix', icon: Cpu },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Left: TM Industrial Solution Branding + Site Location */}
            <div className="flex items-center gap-2 sm:gap-6 min-w-0">
              <TMIndustrialLogo />

              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span>{siteName}</span>
                </div>
              </div>
            </div>

            {/* Center Navigation Tabs (Desktop) */}
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

            {/* Right: Auto-Sync status + Contact Us + Report Download + Notification Bell */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Auto Sync Indicator (Desktop) */}
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync</span>
                {lastUpdatedTime && (
                  <span className="text-emerald-700 font-normal">({lastUpdatedTime})</span>
                )}
              </div>

              {/* Small "Contact Us" Button */}
              {onOpenContact && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenContact}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 shadow-xs transition-colors"
                  title="View / Update TM Industrial Solution Contact Details & Google Maps"
                >
                  <PhoneCall className="h-3.5 w-3.5 mr-1.5 text-red-600" />
                  <span>Contact Us</span>
                </Button>
              )}

              {/* Download Report Button (Desktop & Tablet) */}
              {onOpenReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenReport}
                  className="hidden sm:flex h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-bold border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 shadow-xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5 text-blue-700" />
                  <span>Report</span>
                </Button>
              )}

              {/* Notification Bell */}
              <NotificationCenter
                notifications={notifications}
                onSelectEquipment={onSelectEquipment}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Dedicated Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-pb">
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
            currentTab === 'dashboard'
              ? 'text-blue-600 bg-blue-50/80 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className={`h-4.5 w-4.5 mb-0.5 ${currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Dashboard</span>
        </button>

        {/* Tab 2: Bad Actors Quick Link */}
        <button
          onClick={() => {
            if (currentTab !== 'dashboard') {
              onSelectTab('dashboard');
              setTimeout(() => {
                const el = document.getElementById('top-bad-actors');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            } else {
              const el = document.getElementById('top-bad-actors');
              el?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-all"
        >
          <ShieldAlert className="h-4.5 w-4.5 mb-0.5 text-red-500" />
          <span>Bad Actors</span>
        </button>

        {/* Tab 3: Machine Matrix */}
        <button
          onClick={() => onSelectTab('machines')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
            currentTab === 'machines'
              ? 'text-blue-600 bg-blue-50/80 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className={`h-4.5 w-4.5 mb-0.5 ${currentTab === 'machines' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Matrix</span>
        </button>

        {/* Tab 4: Contact Us Trigger */}
        {onOpenContact && (
          <button
            onClick={onOpenContact}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold text-red-600 hover:text-red-800 transition-all"
          >
            <PhoneCall className="h-4.5 w-4.5 mb-0.5 text-red-600" />
            <span>Contact</span>
          </button>
        )}

        {/* Tab 5: PDF Report Modal Trigger */}
        {onOpenReport && (
          <button
            onClick={onOpenReport}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            <FileText className="h-4.5 w-4.5 mb-0.5 text-blue-600" />
            <span>PDF Report</span>
          </button>
        )}
      </div>
    </>
  );
};

