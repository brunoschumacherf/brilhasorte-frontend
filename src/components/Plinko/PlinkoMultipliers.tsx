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
    if (value >= 10) return 'bg-purple-500/30 text-purple-300';
    if (value >= 5) return 'bg-red-500/30 text-red-400';
    if (value >= 2) return 'bg-yellow-500/30 text-yellow-400';
    if (value >= 1) return 'bg-blue-500/30 text-blue-400';
    return 'bg-gray-700/30 text-gray-400';
  };

  const getDynamicStyles = (rowCount: number) => {
    if (rowCount > 14) {
      return { fontSize: '9px', width: `${pegSpacingX * 0.9}px`, height: `${rowHeight * 0.5}px` };
    }
    if (rowCount > 11) {
      return { fontSize: '10px', width: `${pegSpacingX * 0.95}px`, height: `${rowHeight * 0.45}px` };
    }
    return { fontSize: '12px', width: `${pegSpacingX * 0.95}px`, height: `${rowHeight * 0.45}px` };
  };

  const dynamicStyles = getDynamicStyles(rows);
  const yPosition = topPadding + (rows) * rowHeight;
  const lastRowPegWidth = (rows - 1) * pegSpacingX;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {multipliers.map((m, index) => {
        const xPosition = (width / 2) - (lastRowPegWidth / 2) + (index - 0.3) * pegSpacingX;
        
        return (
          <div
            key={index}
            className={`absolute flex items-center justify-center font-bold rounded-md ${getColorForMultiplier(m)}`}
            style={{
              top: `${yPosition}px`,
              left: `${xPosition}px`,
              transform: 'translateX(-50%)',
              width: dynamicStyles.width,
              height: dynamicStyles.height,
              fontSize: dynamicStyles.fontSize,
            }}
          >
            {m.toFixed(m > 10 ? 0 : m > 1 ? 1 : 2)}
          </div>
        );
      })}
    </div>
  );
};

export default PlinkoMultipliers;