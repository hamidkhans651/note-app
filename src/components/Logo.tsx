// components/Logo.tsx
import { FC } from 'react';

const Logo: FC<{ width?: number; height?: number }> = ({ width = 100, height = 100 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={width} height={height}>
    {/* Background Rectangle (Paper) */}
    
    {/* Pencil Icon */}
    <polygon points="16,48 32,32 48,48 44,52 28,36" fill="#ffcc00" />
    <rect x="28" y="36" width="8" height="12" fill="#ffcc00" />
    <line x1="28" y1="36" x2="44" y2="52" stroke="#666" strokeWidth="2" />
  </svg>
);

export default Logo;
