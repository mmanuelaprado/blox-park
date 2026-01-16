
import React from 'react';

interface Props {
  dayTime: boolean;
  toggleDay: () => void;
}

const UIOverlay: React.FC<Props> = ({ dayTime, toggleDay }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          <h1 className="text-lg sm:text-2xl font-black text-yellow-400 italic uppercase tracking-tighter leading-none">
            BloxPark Mobile
          </h1>
        </div>
        
        <button 
          onClick={toggleDay}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-2xl border-b-4 border-yellow-700 transition-all active:border-b-0 active:translate-y-1 text-sm font-black uppercase"
        >
          {dayTime ? '🌙 NOITE' : '☀️ DIA'}
        </button>
      </div>

      <div className="flex justify-end mb-4">
        <div className="bg-black/40 backdrop-blur-lg p-3 rounded-2xl pointer-events-none border border-white/5">
          <div className="text-right">
            <span className="block text-gray-400 text-[8px] uppercase font-black">Status</span>
            <span className="text-xs font-bold text-green-400">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
