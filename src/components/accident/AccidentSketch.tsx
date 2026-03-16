import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Undo2, Trash2, Pencil, Car, X, MoveRight } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';

const TEMPLATES = [
  { id: 'straight2', label: '2-Lane Road' },
  { id: 'straight4', label: '4-Lane Road' },
  { id: 'tjunction', label: 'T-Junction' },
  { id: 'cross', label: 'Crossroad' },
  { id: 'roundabout', label: 'Roundabout' },
  { id: 'blank', label: 'Blank' },
];

type Tool = 'pen' | 'carA' | 'carB' | 'arrow' | 'xmarker';

function drawTemplate(ctx: CanvasRenderingContext2D, template: string, w: number, h: number) {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;

  ctx.fillStyle = '#888';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;

  const cx = w / 2, cy = h / 2;
  const roadW = 80;

  if (template === 'straight2' || template === 'straight4') {
    const lanes = template === 'straight2' ? 2 : 4;
    const totalW = roadW * lanes / 2;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(cx - totalW, 0, totalW * 2, h);
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#fff';
    for (let i = 1; i < lanes; i++) {
      const x = cx - totalW + (totalW * 2 / lanes) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - totalW, 0); ctx.lineTo(cx - totalW, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + totalW, 0); ctx.lineTo(cx + totalW, h); ctx.stroke();
  } else if (template === 'tjunction') {
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, cy - roadW, w, roadW * 2);
    ctx.fillRect(cx - roadW, cy - roadW, roadW * 2, h - cy + roadW);
    ctx.setLineDash([10, 10]); ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, h); ctx.stroke();
    ctx.setLineDash([]);
  } else if (template === 'cross') {
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, cy - roadW, w, roadW * 2);
    ctx.fillRect(cx - roadW, 0, roadW * 2, h);
    ctx.setLineDash([10, 10]); ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.setLineDash([]);
  } else if (template === 'roundabout') {
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, cy - roadW, w, roadW * 2);
    ctx.fillRect(cx - roadW, 0, roadW * 2, h);
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath(); ctx.arc(cx, cy, roadW * 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, roadW * 1.2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath(); ctx.arc(cx, cy, roadW * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.beginPath(); ctx.arc(cx, cy, roadW * 0.5, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawCarShape(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  const w = 24, h = 44;
  ctx.save();
  // Car body
  ctx.fillStyle = color;
  ctx.strokeStyle = '#1B2A4A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 5);
  ctx.fill();
  ctx.stroke();
  // Windscreen
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(x - w / 2 + 3, y - h / 2 + 6, w - 6, 8);
  // Rear window
  ctx.fillRect(x - w / 2 + 3, y + h / 2 - 14, w - 6, 8);
  // Label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.restore();
}

function drawXMarker(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = 10;
  ctx.save();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
  ctx.restore();
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const headLen = 12;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = '#1B2A4A';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  ctx.restore();
}

export function AccidentSketch() {
  const navigate = useNavigate();
  const { currentIncident, setSketch } = useAccidentStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState('straight2');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.min(rect.width * 1.2, 500);
    drawTemplate(ctx, template, canvas.width, canvas.height);
    if (currentIncident?.sketchDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      };
      img.src = currentIncident.sketchDataUrl;
    } else {
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  }, [template, currentIncident?.sketchDataUrl]);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  if (!currentIncident) { navigate('/'); return null; }

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);

    if (tool === 'carA' || tool === 'carB' || tool === 'xmarker') {
      // Stamp tools: place immediately on tap
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      setHasDrawn(true);
      if (tool === 'carA') drawCarShape(ctx, x, y, '#2563eb', 'A');
      else if (tool === 'carB') drawCarShape(ctx, x, y, '#dc2626', 'B');
      else drawXMarker(ctx, x, y);
      saveSnapshot();
      return;
    }

    if (tool === 'arrow') {
      drawStartRef.current = { x, y };
      setIsDrawing(true);
      setHasDrawn(true);
      return;
    }

    // Pen tool
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1B2A4A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || tool !== 'pen') return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = (e?: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === 'arrow' && drawStartRef.current && e) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const { x, y } = getPos(e);
        drawArrow(ctx, drawStartRef.current.x, drawStartRef.current.y, x, y);
      }
      drawStartRef.current = null;
    }

    saveSnapshot();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    setHistory(newHistory);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSketch(canvas.toDataURL('image/png'));
    }
    navigate('/accident/injuries');
  };

  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: 'pen', label: 'Pen', icon: <Pencil size={14} /> },
    { id: 'carA', label: 'Car A', icon: <Car size={14} /> },
    { id: 'carB', label: 'Car B', icon: <Car size={14} /> },
    { id: 'arrow', label: 'Arrow', icon: <MoveRight size={14} /> },
    { id: 'xmarker', label: 'Impact', icon: <X size={14} /> },
  ];

  return (
    <StepWizard currentStep={6} totalSteps={8} stepLabel="Accident Sketch" onNext={handleSave}>
      <div className="space-y-4">
        {/* Template selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => {
                if (hasDrawn && !window.confirm('Changing the template will clear your drawing. Continue?')) return;
                setHasDrawn(false);
                setTemplate(t.id);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border-2 transition-colors ${template === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tool palette */}
        <div className="flex gap-1.5">
          {tools.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border-2 transition-colors ${
                tool === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white touch-none">
          <canvas ref={canvasRef}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={() => endDraw()}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            className="cursor-crosshair"
            style={{ width: '100%', height: 'auto' }} />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={undo} className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Undo2 size={16} /> Undo
          </button>
          <button onClick={() => {
              if (hasDrawn && !window.confirm('Clear your drawing?')) return;
              setHasDrawn(false);
              initCanvas();
            }} className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Trash2 size={16} /> Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          {tool === 'pen' && 'Draw with your finger to sketch the accident scene'}
          {tool === 'carA' && 'Tap the canvas to place Car A (blue)'}
          {tool === 'carB' && 'Tap the canvas to place Car B (red)'}
          {tool === 'arrow' && 'Drag on the canvas to draw an arrow showing direction'}
          {tool === 'xmarker' && 'Tap the canvas to mark the point of impact'}
        </p>
      </div>
    </StepWizard>
  );
}
