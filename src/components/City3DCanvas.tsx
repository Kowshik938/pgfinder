import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Compass, RotateCcw, Play, Pause } from 'lucide-react';

export interface CityPoint {
  id: string;
  name: string;
  locality: string;
  city: string;
  x: number;
  z: number;
  height: number;
  color: string;
  description: string;
}

interface City3DCanvasProps {
  onSelectLocality?: (locality: string, city: string) => void;
  selectedCity?: string;
}

export const CITY_BEACONS: CityPoint[] = [
  {
    id: '1',
    name: 'Cyber Towers & HITEC City',
    locality: 'Madhapur',
    city: 'Hyderabad',
    x: -65,
    z: -45,
    height: 105,
    color: '#8b5cf6',
    description: 'Heart of Hyderabad tech corridor',
  },
  {
    id: '2',
    name: 'Koramangala 4th Block',
    locality: 'Koramangala',
    city: 'Bangalore',
    x: 45,
    z: -35,
    height: 115,
    color: '#a78bfa',
    description: 'Premier startup and café district',
  },
  {
    id: '3',
    name: 'Gachibowli Financial District',
    locality: 'Gachibowli',
    city: 'Hyderabad',
    x: -25,
    z: 55,
    height: 95,
    color: '#6366f1',
    description: 'Global tech enterprise campuses',
  },
  {
    id: '4',
    name: 'HSR Layout Sector 2',
    locality: 'HSR Layout',
    city: 'Bangalore',
    x: 85,
    z: 35,
    height: 85,
    color: '#c084fc',
    description: 'Tree-lined unicorn startup corridor',
  },
  {
    id: '5',
    name: 'Hinjewadi Tech Hub',
    locality: 'Hinjewadi',
    city: 'Pune',
    x: -85,
    z: 40,
    height: 90,
    color: '#7c3aed',
    description: 'Western India largest IT zone',
  },
  {
    id: '6',
    name: 'OMR IT Expressway',
    locality: 'OMR',
    city: 'Chennai',
    x: 30,
    z: 80,
    height: 80,
    color: '#818cf8',
    description: 'Coastal software corridor',
  },
];

export const City3DCanvas: React.FC<City3DCanvasProps> = ({ onSelectLocality, selectedCity }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredBeacon, setHoveredBeacon] = useState<CityPoint | null>(null);
  const [activeBeaconId, setActiveBeaconId] = useState<string>('1');
  const [cameraAngle, setCameraAngle] = useState(0.45);
  const [cameraPitch, setCameraPitch] = useState(0.52);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  // Mouse drag & interaction
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });

  // Update active beacon if city filter changes
  useEffect(() => {
    if (selectedCity && selectedCity !== 'All') {
      const match = CITY_BEACONS.find((b) => b.city.toLowerCase() === selectedCity.toLowerCase());
      if (match) {
        setActiveBeaconId(match.id);
      }
    }
  }, [selectedCity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let rotation = cameraAngle;
    let pitch = cameraPitch;

    // Procedural city building geometry
    const buildings: Array<{
      x: number;
      z: number;
      w: number;
      d: number;
      h: number;
      hue: number;
      windows: boolean[][];
    }> = [];

    const gridSize = 7;
    const spacing = 40;
    for (let gx = -gridSize; gx <= gridSize; gx++) {
      for (let gz = -gridSize; gz <= gridSize; gz++) {
        // Leave avenues for streets
        if (gx % 3 === 0 || gz % 3 === 0) continue;
        const distFromCenter = Math.sqrt(gx * gx + gz * gz);
        const baseHeight = Math.max(28, 125 - distFromCenter * 13) + Math.sin(gx * 2.8 + gz * 6.5) * 22;

        const rows = Math.floor(baseHeight / 9);
        const cols = 3;
        const windowGrid: boolean[][] = [];
        for (let r = 0; r < rows; r++) {
          windowGrid[r] = [];
          for (let c = 0; c < cols; c++) {
            windowGrid[r][c] = (gx * 3 + gz * 2 + r + c) % 3 !== 0;
          }
        }

        buildings.push({
          x: gx * spacing + (gx * 2),
          z: gz * spacing + (gz * 2),
          w: 22,
          d: 22,
          h: baseHeight,
          hue: 245 + ((gx + 8) * 3) % 25,
          windows: windowGrid,
        });
      }
    }

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = containerRef.current
        ? containerRef.current.getBoundingClientRect()
        : { width: 800, height: 440 };
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Deep atmospheric twilight gradient background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#050612');
      skyGrad.addColorStop(0.4, '#0a0c24');
      skyGrad.addColorStop(0.75, '#13143c');
      skyGrad.addColorStop(1, '#1e184b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Magnetic atmospheric horizon glow in radiant violet & indigo
      const horizonGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.62,
        15,
        width * 0.5,
        height * 0.62,
        width * 0.7
      );
      horizonGlow.addColorStop(0, 'rgba(139, 92, 246, 0.28)');
      horizonGlow.addColorStop(0.35, 'rgba(99, 102, 241, 0.14)');
      horizonGlow.addColorStop(0.7, 'rgba(124, 58, 237, 0.04)');
      horizonGlow.addColorStop(1, 'rgba(5, 6, 18, 0)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      if (isAutoRotate && !mouseRef.current.isDown) {
        rotation += 0.0016;
      }

      time += 0.028;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const tilt = pitch;
      const centerX = width * 0.5;
      const centerY = height * 0.62;

      // Project 3D point (x, y, z) into 2D isometric screen coordinates
      const project = (x: number, y: number, z: number) => {
        const rx = x * cosR - z * sinR;
        const rz = x * sinR + z * cosR;
        const px = centerX + rx;
        const py = centerY + rz * tilt - y;
        return { px, py, depth: rz };
      };

      // Ground plane grid lines with subtle violet falloff
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.05)';
      ctx.lineWidth = 1;
      const groundSize = 340;
      for (let g = -groundSize; g <= groundSize; g += 34) {
        const p1 = project(g, 0, -groundSize);
        const p2 = project(g, 0, groundSize);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(-groundSize, 0, g);
        const p4 = project(groundSize, 0, g);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }

      // Moving transit light trails on tech avenues
      const roadCount = 5;
      for (let r = 0; r < roadCount; r++) {
        const roadZ = (r - 2) * 95;
        const streamOffset = ((time * 60 + r * 85) % 640) - 320;
        const sp1 = project(streamOffset - 40, 0, roadZ);
        const sp2 = project(streamOffset + 40, 0, roadZ);

        ctx.strokeStyle =
          r % 2 === 0 ? 'rgba(192, 132, 252, 0.65)' : 'rgba(147, 197, 253, 0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sp1.px, sp1.py);
        ctx.lineTo(sp2.px, sp2.py);
        ctx.stroke();
      }

      // Sort buildings back to front by projected depth
      const sortedBuildings = [...buildings].sort((a, b) => {
        const depthA = a.x * sinR + a.z * cosR;
        const depthB = b.x * sinR + b.z * cosR;
        return depthB - depthA;
      });

      // Render buildings with subtle glowing bevels
      sortedBuildings.forEach((b) => {
        const hw = b.w * 0.5;
        const hd = b.d * 0.5;

        // Base corners
        const c1 = project(b.x - hw, 0, b.z - hd);
        const c2 = project(b.x + hw, 0, b.z - hd);
        const c3 = project(b.x + hw, 0, b.z + hd);
        const c4 = project(b.x - hw, 0, b.z + hd);

        // Roof corners
        const t1 = project(b.x - hw, b.h, b.z - hd);
        const t2 = project(b.x + hw, b.h, b.z - hd);
        const t3 = project(b.x + hw, b.h, b.z + hd);
        const t4 = project(b.x - hw, b.h, b.z + hd);

        // Dark side wall
        ctx.beginPath();
        ctx.moveTo(c1.px, c1.py);
        ctx.lineTo(c4.px, c4.py);
        ctx.lineTo(t4.px, t4.py);
        ctx.lineTo(t1.px, t1.py);
        ctx.closePath();
        ctx.fillStyle = `hsl(${b.hue}, 40%, 11%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.08)';
        ctx.stroke();

        // Front illuminated side wall
        ctx.beginPath();
        ctx.moveTo(c4.px, c4.py);
        ctx.lineTo(c3.px, c3.py);
        ctx.lineTo(t3.px, t3.py);
        ctx.lineTo(t4.px, t4.py);
        ctx.closePath();
        ctx.fillStyle = `hsl(${b.hue}, 45%, 17%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.12)';
        ctx.stroke();

        // Roof plate
        ctx.beginPath();
        ctx.moveTo(t1.px, t1.py);
        ctx.lineTo(t2.px, t2.py);
        ctx.lineTo(t3.px, t3.py);
        ctx.lineTo(t4.px, t4.py);
        ctx.closePath();
        ctx.fillStyle = `hsl(${b.hue}, 42%, 22%)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.2)';
        ctx.stroke();

        // Window lighting with warm amber and soft lavender
        const rows = b.windows.length;
        for (let row = 0; row < rows; row += 2) {
          const windowY = (row / rows) * b.h + 6;
          const wp = project(b.x, windowY, b.z + hd);
          if (b.windows[row][0]) {
            ctx.fillStyle = 'rgba(216, 180, 254, 0.7)';
            ctx.fillRect(wp.px - 3.5, wp.py - 1.2, 2.5, 1.8);
          }
          if (b.windows[row][1]) {
            ctx.fillStyle = 'rgba(252, 211, 77, 0.65)';
            ctx.fillRect(wp.px + 1.5, wp.py - 1.2, 2.5, 1.8);
          }
        }
      });

      // Render PG Tech Hub Beacons
      CITY_BEACONS.forEach((beacon) => {
        const top = project(beacon.x, beacon.height + 18, beacon.z);
        const base = project(beacon.x, 0, beacon.z);

        const isHovered = hoveredBeacon?.id === beacon.id;
        const isActive = activeBeaconId === beacon.id;

        // Upward laser beacon line
        ctx.beginPath();
        ctx.moveTo(base.px, base.py);
        ctx.lineTo(top.px, top.py);
        ctx.strokeStyle = isActive
          ? 'rgba(192, 132, 252, 0.95)'
          : isHovered
          ? 'rgba(167, 139, 250, 0.85)'
          : 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = isActive ? 2.5 : isHovered ? 2 : 1.2;
        ctx.stroke();

        // Pulsing ground radar ring
        const pulse = (Math.sin(time * 2.2 + parseInt(beacon.id, 10)) + 1) * 0.5;
        const ringRadius = 10 + pulse * 7;
        ctx.beginPath();
        ctx.ellipse(base.px, base.py, ringRadius, ringRadius * tilt, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isActive
          ? '#c084fc'
          : isHovered
          ? 'rgba(167, 139, 250, 0.7)'
          : 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glowing Beacon Head
        const orbRadius = isActive ? 7.5 : isHovered ? 7 : 5;
        ctx.beginPath();
        ctx.arc(top.px, top.py, orbRadius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#ffffff' : beacon.color;
        ctx.shadowColor = beacon.color;
        ctx.shadowBlur = isActive ? 18 : isHovered ? 14 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Floating Locality Label
        ctx.font = '600 11px Plus Jakarta Sans, -apple-system, sans-serif';
        const labelText = beacon.locality;
        const textMetrics = ctx.measureText(labelText);
        const boxWidth = textMetrics.width + 16;
        const boxHeight = 22;

        const boxX = top.px - boxWidth / 2;
        const boxY = top.py - 28;

        ctx.fillStyle = isActive
          ? 'rgba(24, 27, 49, 0.96)'
          : isHovered
          ? 'rgba(20, 23, 42, 0.92)'
          : 'rgba(14, 16, 30, 0.85)';
        ctx.strokeStyle = isActive
          ? 'rgba(192, 132, 252, 0.8)'
          : isHovered
          ? 'rgba(167, 139, 250, 0.5)'
          : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isActive ? '#ffffff' : isHovered ? '#f1f5f9' : '#cbd5e1';
        ctx.fillText(labelText, boxX + 8, boxY + 15);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [cameraAngle, cameraPitch, isAutoRotate, hoveredBeacon, activeBeaconId]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = e.clientX;
    mouseRef.current.lastY = e.clientY;
    setIsAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseRef.current.isDown) {
      const deltaX = e.clientX - mouseRef.current.lastX;
      const deltaY = e.clientY - mouseRef.current.lastY;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;

      setCameraAngle((prev) => prev + deltaX * 0.005);
      setCameraPitch((prev) => Math.max(0.35, Math.min(0.75, prev + deltaY * 0.002)));
    }
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  const handleSelectBeacon = (beacon: CityPoint) => {
    setActiveBeaconId(beacon.id);
    if (onSelectLocality) {
      onSelectLocality(beacon.locality, beacon.city);
    }
  };

  const resetCamera = () => {
    setCameraAngle(0.45);
    setCameraPitch(0.52);
    setIsAutoRotate(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] overflow-hidden rounded-3xl border border-white/[0.08] select-none cursor-grab active:cursor-grabbing bg-[#070810]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Atmosphere & Camera Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="text-[11px] font-medium text-slate-300 bg-[#0e101c]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.08] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span>3D Interactive City Hubs</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all backdrop-blur-md border cursor-pointer flex items-center gap-1.5 ${
              isAutoRotate
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                : 'bg-[#0e101c]/80 text-slate-400 border-white/[0.08] hover:text-white'
            }`}
          >
            {isAutoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoRotate ? 'Orbiting' : 'Paused'}</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-[#0e101c]/80 backdrop-blur-md border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            title="Reset camera angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Locality Selector Strip */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline mr-1">
            Tech Districts:
          </span>
          {CITY_BEACONS.map((beacon) => {
            const isActive = activeBeaconId === beacon.id;
            return (
              <button
                key={beacon.id}
                onClick={() => handleSelectBeacon(beacon)}
                onMouseEnter={() => setHoveredBeacon(beacon)}
                onMouseLeave={() => setHoveredBeacon(null)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-sm'
                    : 'bg-[#0e101c]/80 hover:bg-white/[0.06] border-white/[0.08] text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
                <span>{beacon.locality}</span>
                <span className="text-[10px] text-slate-500 hidden lg:inline">· {beacon.city}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 bg-[#0e101c]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.08] self-start sm:self-auto flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-purple-400" />
          <span>Click district or drag to orbit</span>
        </div>
      </div>
    </div>
  );
};
