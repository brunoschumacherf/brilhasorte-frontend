import React from 'react';

interface PlinkoMultipliersProps {
  multipliers: number[];
  boardDimensions: { rowHeight: number, topPadding: number, width: number, pegSpacingX: number } | null;
  rows: number;
}

const PlinkoMultipliers: React.FC<PlinkoMultipliersProps> = ({ multipliers, boardDimensions, rows }) => {
  if (!boardDimensions || multipliers.length === 0) return null;

  const { rowHeight, topPadding, width, pegSpacingX } = boardDimensions;

  const getColorForMultiplier = (value: number) => {
    if (value >= 10) return 'from-purple-500 to-indigo-600 text-purple-200';
    if (value >= 5) return 'from-red-500 to-orange-600 text-red-200';
    if (value >= 2) return 'from-yellow-500 to-amber-600 text-yellow-100';
    if (value >= 1) return 'from-blue-500 to-cyan-600 text-blue-200';
    return 'from-zinc-700 to-zinc-800 text-zinc-400';
  };

  const getDynamicStyles = (rowCount: number) => {
    if (rowCount > 14) return { fontSize: '9px', width: `${pegSpacingX * 0.9}px`, height: `${rowHeight * 0.5}px` };
    if (rowCount > 11) return { fontSize: '10px', width: `${pegSpacingX * 0.95}px`, height: `${rowHeight * 0.45}px` };
    return { fontSize: '12px', width: `${pegSpacingX * 0.95}px`, height: `${rowHeight * 0.45}px` };
  };

  const dynamicStyles = getDynamicStyles(rows);
  const yPosition = topPadding + (rows) * rowHeight;
  const totalSlotsWidth = (rows + 1) * pegSpacingX;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {multipliers.map((m, index) => {
        // ✨ CORRIGIDO: Cálculo da posição X para um alinhamento preciso com as saídas.
        const xPosition = (width / 2) - (totalSlotsWidth / 2) + (index * pegSpacingX) + (pegSpacingX / 2);
        
        return (
          <div
            key={index}
            className={`absolute flex items-center justify-center font-bold rounded-md bg-gradient-to-br shadow-inner shadow-black/20`}
            style={{
              top: `${yPosition}px`,
              left: `${xPosition}px`,
              transform: 'translateX(-50%)',
              width: dynamicStyles.width,
              height: dynamicStyles.height,
              fontSize: dynamicStyles.fontSize,
            }}
          >
            <div className={`w-full h-full flex items-center justify-center rounded-md ${getColorForMultiplier(m)}`}>
                {m.toFixed(m > 10 ? 0 : m > 1 ? 1 : 2)}x
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlinkoMultipliers;
