import React from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnergyBar({ energy }) {
  const getEnergyIcon = () => {
    if (energy >= 75) return BatteryFull;
    if (energy >= 40) return BatteryMedium;
    if (energy >= 20) return BatteryLow;
    return Battery;
  };

  const getEnergyColor = () => {
    if (energy >= 75) return 'from-green-500 to-emerald-600';
    if (energy >= 40) return 'from-yellow-500 to-orange-500';
    if (energy >= 20) return 'from-orange-500 to-red-500';
    return 'from-red-600 to-red-800';
  };

  const getEnergyText = () => {
    if (energy >= 75) return 'Energizado';
    if (energy >= 40) return 'Normal';
    if (energy >= 20) return 'Cansado';
    return 'Exausto';
  };

  const Icon = getEnergyIcon();

  return (
    <div className="flex items-center gap-3">
      <Icon className={cn("w-5 h-5", energy < 20 && "animate-pulse")} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">{getEnergyText()}</span>
          <span className="text-xs font-bold">{energy}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full bg-gradient-to-r transition-all duration-500", getEnergyColor())}
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>
    </div>
  );
}