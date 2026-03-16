import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Undo2, Trash2, Pencil } from 'lucide-react';
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

export function AccidentSketch() {
  const navigate = useNavigate();
  const { currentIncident, setSketch } = useAccidentStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState('straight2');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.min(rect.width * 1.2, 500);
    drawTemplate(ctx, template, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, [template]);

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

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1B2A4A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
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

  return (
    <StepWizard currentStep={6} totalSteps={8} stepLabel="Accident Sketch" onNext={handleSave}>
      <div className="space-y-4">
        {/* Template selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border-2 transition-colors ${template === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white touch-none">
          <canvas ref={canvasRef}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            className="w-full cursor-crosshair" />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button onClick={undo} className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Undo2 size={16} /> Undo
          </button>
          <button onClick={initCanvas} className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm">
            <Trash2 size={16} /> Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <Pencil size={12} /> Draw with your finger to sketch the accident scene
        </p>
      </div>
    </StepWizard>
  );
}
