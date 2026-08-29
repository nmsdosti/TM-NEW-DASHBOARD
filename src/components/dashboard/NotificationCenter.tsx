import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppNotification } from '@/types/vibration';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onSelectEquipment?: (equipmentName: string) => void;
  onClearAll?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onSelectEquipment,
  onClearAll,
}) => {
  const [items, setItems] = useState<AppNotification[]>(notifications);
  const [open, setOpen] = useState(false);

  // Sync when prop changes
  React.useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  const unreadCount = items.filter((n) => !n.read).length;
  const alarmCount = items.filter((n) => n.type === 'Alarm').length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEquipmentClick = (equipmentName: string) => {
    setOpen(false);
    if (onSelectEquipment) {
      onSelectEquipment(equipmentName);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 border-border/80 bg-card hover:bg-muted/80 text-foreground transition-all"
          aria-label="Vibration Notifications"
        >
          <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 border border-border shadow-2xl bg-card rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Diagnostic Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
              >
                Mark Read
              </Button>
            )}
          </div>
        </div>

        {/* Alarm Alert Summary Pill */}
        {alarmCount > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-3.5 py-2 flex items-center justify-between text-xs">
            <span className="text-destructive font-semibold flex items-center gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5 animate-pulse" />
              {alarmCount} Equipment in Alarm State
            </span>
            <span className="text-[10px] text-destructive/80 font-medium">Action Required</span>
          </div>
        )}

        {/* Notification List */}
        <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40">
          {items.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-foreground">All Clear</p>
              <p className="text-xs text-muted-foreground">
                No active vibration warnings or alarms detected on monitored assets.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isAlarm = item.type === 'Alarm';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors text-left relative group ${
                    !item.read ? 'bg-muted/40 font-medium' : 'hover:bg-muted/20'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon */}
                    <div
                      className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                        isAlarm
                          ? 'bg-destructive/15 text-destructive'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {isAlarm ? (
                        <AlertOctagon className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleEquipmentClick(item.equipmentName)}
                          className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate text-left"
                        >
                          {item.title}
                        </button>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.measurementSummary && (
                        <div className="text-[10px] font-semibold text-foreground/80 bg-muted/80 px-2 py-0.5 rounded inline-block">
                          {item.measurementSummary}
                        </div>
                      )}

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          onClick={() => handleEquipmentClick(item.equipmentName)}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          View Diagnostics
                          <ExternalLink className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] text-muted-foreground hover:text-destructive p-1 rounded"
                          title="Dismiss notification"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-2 border-t border-border/60 bg-muted/20 text-center">
            <button
              onClick={() => {
                if (onClearAll) onClearAll();
                setItems([]);
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
