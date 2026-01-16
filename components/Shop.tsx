
import React from 'react';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  color: string;
  type: 'hat' | 'cape';
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'red_hat', name: 'Boné Vermelho', price: 50, color: '#ef4444', type: 'hat' },
  { id: 'blue_hat', name: 'Boné Azul', price: 50, color: '#3b82f6', type: 'hat' },
  { id: 'gold_crown', name: 'Coroa de Ouro', price: 250, color: '#facc15', type: 'hat' },
  { id: 'dark_cape', name: 'Capa Sombria', price: 150, color: '#1e293b', type: 'cape' },
  { id: 'hero_cape', name: 'Capa Herói', price: 150, color: '#ef4444', type: 'cape' },
];

interface ShopProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  ownedItems: string[];
  setOwnedItems: React.Dispatch<React.SetStateAction<string[]>>;
  activeAccessory: string | null;
  setActiveAccessory: React.Dispatch<React.SetStateAction<string | null>>;
  closeShop: () => void;
}

const Shop: React.FC<ShopProps> = ({ 
  coins, setCoins, ownedItems, setOwnedItems, activeAccessory, setActiveAccessory, closeShop 
}) => {
  const handlePurchase = (item: ShopItem) => {
    if (ownedItems.includes(item.id)) {
      setActiveAccessory(activeAccessory === item.id ? null : item.id);
      return;
    }
    if (coins >= item.price) {
      setCoins(prev => prev - item.price);
      setOwnedItems(prev => [...prev, item.id]);
      setActiveAccessory(item.id);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40 pointer-events-auto">
      <div className="bg-gray-800 w-full max-w-md rounded-3xl border-4 border-yellow-500 overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
        <div className="p-6 bg-yellow-500 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 uppercase italic">Avatar Shop</h2>
          <button onClick={closeShop} className="bg-gray-900 text-white w-10 h-10 rounded-full font-bold">X</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map(item => {
            const isOwned = ownedItems.includes(item.id);
            const isActive = activeAccessory === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => handlePurchase(item)}
                className={`p-4 rounded-2xl border-4 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  isActive ? 'border-green-400 bg-green-900/20' : isOwned ? 'border-blue-400 bg-blue-900/20' : 'border-gray-700 bg-gray-700/50 hover:scale-105'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-lg shadow-lg" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-xs text-center uppercase">{item.name}</span>
                <div className="flex items-center gap-1">
                  {isOwned ? (
                    <span className="text-[10px] font-black text-green-400 uppercase">{isActive ? 'Equipado' : 'Equipar'}</span>
                  ) : (
                    <>
                      <span className="text-yellow-400 font-bold text-sm">💰 {item.price}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-center">
          <p className="text-yellow-400 font-black tracking-widest uppercase text-sm">Saldo: {coins} BloxCoins</p>
        </div>
      </div>
    </div>
  );
};

export default Shop;
