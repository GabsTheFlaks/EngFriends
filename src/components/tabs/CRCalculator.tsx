import React, { useState } from 'react';

interface CRCalculatorProps {
  isDarkMode: boolean;
}

export function CRCalculator({ isDarkMode }: CRCalculatorProps) {
  const [grades, setGrades] = useState({ p1: '', p2: '', p3: '', p4: '' });
  const [crResult, setCrResult] = useState<number | null>(null);

  const handleCalculateCR = (e: React.FormEvent) => {
    e.preventDefault();
    const values = [
      parseFloat(grades.p1),
      parseFloat(grades.p2),
      parseFloat(grades.p3),
      parseFloat(grades.p4)
    ].filter(v => !isNaN(v));

    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      setCrResult(Number((sum / values.length).toFixed(2)));
    }
  };

  return (
    <form onSubmit={handleCalculateCR} className="space-y-3 animate-fade-in text-left">
      <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
        Simule sua média geral (CR) baseada nas notas bimestrais (P1 a P4).
      </p>

      <div className="grid grid-cols-2 gap-2">
        {['p1', 'p2', 'p3', 'p4'].map((p, idx) => (
          <div key={p} className="flex flex-col gap-1">
            <label className={`text-[9px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Nota {idx + 1}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={grades[p as keyof typeof grades]}
              onChange={e => setGrades({ ...grades, [p]: e.target.value })}
              placeholder="0.0"
              className={`w-full px-2 py-1.5 rounded-lg text-xs border font-medium ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300 focus:border-blue-500'
              } focus:ring-1 focus:ring-blue-500 outline-none transition-all`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1.5">
        <button
          type="submit"
          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
        >
          Calcular Média
        </button>
        <button
          type="button"
          onClick={() => {
            setGrades({p1: '', p2: '', p3: '', p4: ''});
            setCrResult(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${isDarkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-850' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        >
          Reset
        </button>
      </div>

      {crResult !== null && (
        <div className={`p-3 rounded-lg flex items-center justify-between border mt-2 ${crResult >= 6.0 ? (isDarkMode ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700') : (isDarkMode ? 'bg-red-950/20 border-red-900/20 text-red-400' : 'bg-red-50 border-red-100 text-red-655')}`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{crResult >= 6.0 ? '🎉' : '📚'}</span>
            <div className="text-[10px] font-bold">Média Estimada:</div>
          </div>
          <div className="text-xs font-black text-right">{crResult} / 10</div>
        </div>
      )}
    </form>
  );
}
