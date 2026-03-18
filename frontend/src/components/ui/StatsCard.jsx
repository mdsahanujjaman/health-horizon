import React from 'react';
import Card from './Card';

const StatsCard = ({
  label,
  value,
  icon: Icon,
  unit,
  tone = 'primary',
  subtext,
  onClick,
  size = 'normal',
}) => {
  const tones = {
    primary: 'text-sky-500 bg-sky-500/10',
    secondary: 'text-indigo-500 bg-indigo-500/10',
    success: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    danger: 'text-rose-500 bg-rose-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
    pink: 'text-pink-500 bg-pink-500/10',
    teal: 'text-teal-500 bg-teal-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
  };

  const isLarge = size === 'large';

  return (
    <Card className="p-6 cursor-default h-full" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <p
          className={`text-slate-500 font-bold uppercase tracking-wider ${isLarge ? 'text-sm' : 'text-[10px]'}`}
        >
          {label}
        </p>
        <div
          className={`p-3 rounded-2xl ${tones[tone] || tones.primary} transition-transform group-hover:scale-110`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <h3
          className={`${isLarge ? 'text-5xl' : 'text-4xl'} font-black text-slate-800 tracking-tight`}
        >
          {value}
        </h3>
        {unit && <span className="text-sm font-bold text-slate-400 uppercase">{unit}</span>}
      </div>
      {subtext && <p className="text-xs text-slate-400 font-medium mt-2">{subtext}</p>}
    </Card>
  );
};

export default StatsCard;
