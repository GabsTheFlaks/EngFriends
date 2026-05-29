import React from 'react';

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function AvatarPicker({ selectedIndex, onSelect }: AvatarPickerProps) {
  const avatars = Array.from({ length: 10 }, (_, i) => `/avatars/avatar_${i}.svg`);

  return (
    <div className="grid grid-cols-5 gap-3 p-4">
      {avatars.map((avatar, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          type="button"
          className={`relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 ${
            selectedIndex === index
              ? 'ring-4 ring-eng-blue scale-110'
              : 'hover:bg-slate-100 hover:scale-105 border border-slate-200'
          }`}
        >
          <img src={avatar} alt={`Avatar ${index}`} className="w-8 h-8 opacity-80" />
        </button>
      ))}
    </div>
  );
}
