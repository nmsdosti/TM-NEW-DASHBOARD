import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VibrationData } from '@/types/vibration';
import { getConditionColor } from '@/lib/csvParser';
import { Activity, MapPin } from 'lucide-react';

interface EquipmentCardProps {
  equipment: VibrationData;
  onClick: () => void;
}

export const EquipmentCard = ({ equipment, onClick }: EquipmentCardProps) => {
  const conditionColor = getConditionColor(equipment.condition);

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{equipment.equipmentName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{equipment.area}</span>
            </div>
          </div>
          <Badge variant={conditionColor as any} className="font-semibold">
            {equipment.condition}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Class:</span>
          <span className="font-medium">{equipment.class}</span>
        </div>
        
        {equipment.observation && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Latest Observation</p>
            <p className="text-sm line-clamp-2">{equipment.observation}</p>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[1, 2, 3, 4].map((point) => {
            const measurement = equipment.measurements[`point0${point}` as keyof typeof equipment.measurements];
            const maxValue = Math.max(measurement.av, measurement.hv, measurement.vv);
            return (
              <div key={point} className="rounded-md bg-muted/30 p-2 text-center">
                <p className="text-xs text-muted-foreground">P{point}</p>
                <p className="text-sm font-bold">{maxValue.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
