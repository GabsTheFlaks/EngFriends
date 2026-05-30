import React from 'react';

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  isDarkMode?: boolean;
}

export function AvatarPicker({ selectedIndex, onSelect, isDarkMode = false }: AvatarPickerProps) {
  // 10 avatar icons indexes
  const avatars = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="flex flex-col space-y-3 text-left">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        Selecione seu Avatar
      </span>
      <div className="grid grid-cols-5 gap-3">
        {avatars.map((index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-110 focus:outline-none ${
                isSelected
                  ? 'ring-4 ring-blue-500/50 border-2 border-blue-500 scale-105 shadow-md shadow-blue-500/10'
                  : 'border border-transparent hover:shadow-sm'
              }`}
            >
              <img
                src={`/avatars/avatar_${index}.png`}
                alt={`Avatar ${index}`}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
