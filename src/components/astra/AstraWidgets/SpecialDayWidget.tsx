import React from 'react';
import { Sparkles, CalendarHeart } from 'lucide-react';
import { specialDayTool } from '../../../services/tools/SpecialDayTool';

export const SpecialDayWidget: React.FC = () => {
  const { currentEvent, nextEvent } = specialDayTool.getSpecialDayInfo();

  return (
    <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between font-sans text-xs w-64">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-purple-300">
          <CalendarHeart className="w-4 h-4 text-pink-400" />
          <span className="font-bold text-white text-xs">Special Day</span>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
      </div>

      <div className="my-2.5">
        {currentEvent ? (
          <div>
            <h4 className="font-bold text-amber-300 text-xs">{currentEvent.title}</h4>
            <p className="text-[11px] text-white/70 mt-1">{currentEvent.description}</p>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold text-white/90 text-xs">Nothing special today</h4>
            <p className="text-[10px] text-white/50 mt-1 font-mono">All calendar events clear</p>
          </div>
        )}
      </div>

      <div className="text-[10px] font-mono text-white/50 border-t border-white/10 pt-2 flex items-center justify-between">
        <span>Next Event:</span>
        <span className="text-cyan-300 font-semibold truncate max-w-[130px]">{nextEvent ? nextEvent.title : 'None'}</span>
      </div>
    </div>
  );
};
