import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Sun,
  Moon,
  Eye,
  Maximize2,
  Sparkles,
  Bed,
  Layers,
  Info,
} from 'lucide-react';

interface ViewerProps {
  roomType?: string;
  onClose?: () => void;
}

export const Accommodation3DViewer: React.FC<ViewerProps> = ({
  roomType = 'Executive Single Room',
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(45);
  const [isNightMode, setIsNightMode] = useState(false);
  const [wallColor, setWallColor] = useState('#1e293b'); // slate-800
  const [selectedItem, setSelectedItem] = useState<string | null>('Ergonomic Study Workstation');

  // Animation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isNightMode) {
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(1, '#020408');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#0b0f19');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Center origin
      const centerX = width / 2;
      const centerY = height / 2 + 50;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Isometric projection helper: (x, y, z) -> (screenX, screenY)
      const project = (x: number, y: number, z: number) => {
        const rotX = x * cos - y * sin;
        const rotY = (x * sin + y * cos) * 0.5;
        return {
          px: centerX + rotX,
          py: centerY + rotY - z,
        };
      };

      // Draw Room Floor Plate (160 x 160)
      const f1 = project(-110, -110, 0);
      const f2 = project(110, -110, 0);
      const f3 = project(110, 110, 0);
      const f4 = project(-110, 110, 0);

      ctx.beginPath();
      ctx.moveTo(f1.px, f1.py);
      ctx.lineTo(f2.px, f2.py);
      ctx.lineTo(f3.px, f3.py);
      ctx.lineTo(f4.px, f4.py);
      ctx.closePath();
      ctx.fillStyle = isNightMode ? '#1e1b4b' : '#334155';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Back Walls
      const wTop1 = project(-110, -110, 100);
      const wTop2 = project(110, -110, 100);
      const wTop4 = project(-110, 110, 100);

      // Left Wall
      ctx.beginPath();
      ctx.moveTo(f1.px, f1.py);
      ctx.lineTo(f4.px, f4.py);
      ctx.lineTo(wTop4.px, wTop4.py);
      ctx.lineTo(wTop1.px, wTop1.py);
      ctx.closePath();
      ctx.fillStyle = isNightMode ? '#0f172a' : wallColor;
      ctx.fill();
      ctx.stroke();

      // Right Wall
      ctx.beginPath();
      ctx.moveTo(f1.px, f1.py);
      ctx.lineTo(f2.px, f2.py);
      ctx.lineTo(wTop2.px, wTop2.py);
      ctx.lineTo(wTop1.px, wTop1.py);
      ctx.closePath();
      ctx.fillStyle = isNightMode ? '#1e293b' : '#1e293b';
      ctx.fill();
      ctx.stroke();

      // Window on Left Wall
      const win1 = project(-110, -30, 40);
      const win2 = project(-110, 50, 40);
      const win3 = project(-110, 50, 85);
      const win4 = project(-110, -30, 85);

      ctx.beginPath();
      ctx.moveTo(win1.px, win1.py);
      ctx.lineTo(win2.px, win2.py);
      ctx.lineTo(win3.px, win3.py);
      ctx.lineTo(win4.px, win4.py);
      ctx.closePath();
      ctx.fillStyle = isNightMode ? '#38bdf8' : '#e0f2fe';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Bed (Wooden frame + white mattress + blue blanket)
      const b1 = project(-80, -90, 0);
      const b2 = project(20, -90, 0);
      const b3 = project(20, -20, 0);
      const b4 = project(-80, -20, 0);

      const bTop1 = project(-80, -90, 20);
      const bTop2 = project(20, -90, 20);
      const bTop3 = project(20, -20, 20);
      const bTop4 = project(-80, -20, 20);

      // Bed side
      ctx.beginPath();
      ctx.moveTo(b4.px, b4.py);
      ctx.lineTo(b3.px, b3.py);
      ctx.lineTo(bTop3.px, bTop3.py);
      ctx.lineTo(bTop4.px, bTop4.py);
      ctx.closePath();
      ctx.fillStyle = '#b45309';
      ctx.fill();

      // Bed mattress top
      ctx.beginPath();
      ctx.moveTo(bTop1.px, bTop1.py);
      ctx.lineTo(bTop2.px, bTop2.py);
      ctx.lineTo(bTop3.px, bTop3.py);
      ctx.lineTo(bTop4.px, bTop4.py);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      // Pillow
      const p1 = project(-75, -85, 23);
      const p2 = project(-40, -85, 23);
      const p3 = project(-40, -60, 23);
      const p4 = project(-75, -60, 23);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.lineTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.closePath();
      ctx.fillStyle = '#6366f1';
      ctx.fill();

      // Study Desk with Laptop
      const d1 = project(-90, 30, 0);
      const d2 = project(-40, 30, 0);
      const d3 = project(-40, 90, 0);
      const d4 = project(-90, 90, 0);

      const dTop1 = project(-90, 30, 35);
      const dTop2 = project(-40, 30, 35);
      const dTop3 = project(-40, 90, 35);
      const dTop4 = project(-90, 90, 35);

      ctx.beginPath();
      ctx.moveTo(dTop1.px, dTop1.py);
      ctx.lineTo(dTop2.px, dTop2.py);
      ctx.lineTo(dTop3.px, dTop3.py);
      ctx.lineTo(dTop4.px, dTop4.py);
      ctx.closePath();
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.stroke();

      // Laptop glowing screen
      const l1 = project(-70, 50, 38);
      const l2 = project(-50, 50, 38);
      const l3 = project(-50, 70, 50);
      const l4 = project(-70, 70, 50);
      ctx.beginPath();
      ctx.moveTo(l1.px, l1.py);
      ctx.lineTo(l2.px, l2.py);
      ctx.lineTo(l3.px, l3.py);
      ctx.lineTo(l4.px, l4.py);
      ctx.closePath();
      ctx.fillStyle = isNightMode ? '#38bdf8' : '#e2e8f0';
      ctx.fill();

      // Split AC Unit on Right Wall
      const ac1 = project(50, -110, 75);
      const ac2 = project(95, -110, 75);
      const ac3 = project(95, -110, 90);
      const ac4 = project(50, -110, 90);
      ctx.beginPath();
      ctx.moveTo(ac1.px, ac1.py);
      ctx.lineTo(ac2.px, ac2.py);
      ctx.lineTo(ac3.px, ac3.py);
      ctx.lineTo(ac4.px, ac4.py);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();
    };

    render();
  }, [angle, isNightMode, wallColor]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 8 — 3D Spatial Accommodation Visualizer
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Interactive Room Tour: {roomType}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Drag the orbit slider below to inspect furniture layout, ergonomic desk, AC unit, and
            ventilation window.
          </p>
        </div>

        {/* Lighting & Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isNightMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isNightMode ? 'Day Mode' : 'Night Lighting'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex items-center justify-center h-80 sm:h-96">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
        />

        {/* Orbit Angle Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono shadow-lg pointer-events-none">
          Angle: {angle}° Isometric
        </div>

        {/* Room Spec Badge */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 shadow-lg pointer-events-none">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Area: 140 sq.ft • High Ceiling</span>
        </div>
      </div>

      {/* Orbit & Wall Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Orbit View Rotation:</span>
          <input
            type="range"
            min="10"
            max="80"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value, 10))}
            className="w-36 accent-indigo-500 cursor-pointer"
          />
          <span className="font-mono text-white">{angle}°</span>
        </div>

        {/* Wall Accent Palette */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Wall Tone:</span>
          {[
            { color: '#1e293b', label: 'Slate' },
            { color: '#14532d', label: 'Forest Green' },
            { color: '#4c1d95', label: 'Deep Purple' },
            { color: '#7c2d12', label: 'Warm Terracotta' },
          ].map((w) => (
            <button
              key={w.color}
              onClick={() => setWallColor(w.color)}
              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                wallColor === w.color ? 'scale-125 border-white shadow-md' : 'border-slate-700'
              }`}
              style={{ backgroundColor: w.color }}
              title={w.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
