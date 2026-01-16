
import React from 'react';

interface Props {
  dayTime: boolean;
  toggleDay: () => void;
  coins: number;
  openShop: () => void;
}

const UIOverlay: React.FC<Props> = ({ dayTime, toggleDay, coins, openShop }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 sm:p-6">
      <div className="flex justify-between items-start pointer-events-auto gap-4">
        <div className="flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <h1 className="text-lg sm:text-2xl font-black text-yellow-400 italic uppercase tracking-tighter leading-none">
              BloxPark
            </h1>
          </div>
          <div className="bg-gray-900/80 p-2 px-4 rounded-xl border-2 border-yellow-500 flex items-center gap-2 shadow-lg">
             <span className="text-xl">💰</span>
             <span className="text-yellow-400 font-black text-lg tracking-wider">{coins}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={openShop}
            className="bg-green-500 hover:bg-green-400 text-white px-4 py-3 rounded-2xl border-b-4 border-green-700 transition-all active:border-b-0 active:translate-y-1 text-sm font-black uppercase shadow-lg"
          >
            🛒 LOJA
          </button>
          <button 
            onClick={toggleDay}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-3 rounded-2xl border-b-4 border-yellow-700 transition-all active:border-b-0 active:translate-y-1 text-sm font-black uppercase shadow-lg"
          >
            {dayTime ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="bg-black/40 backdrop-blur-lg p-3 rounded-2xl pointer-events-none border border-white/5">
          <div className="text-right">
            <span className="block text-gray-400 text-[8px] uppercase font-black">Status</span>
            <span className="text-xs font-bold text-green-400">SERVER ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
