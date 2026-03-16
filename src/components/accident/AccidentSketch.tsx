import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Undo2, Trash2, Pencil, Car, X, Navigation, MousePointer2 } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';
import { renderCanvas, drawArrow, hitTest } from '../../utils/sketchRenderer';
import type { SketchElement, ToolType } from '../../types/sketch';
import { CAR_PALETTE } from '../../types/sketch';

const TEMPLATES = [
  { id: 'straight2', label: '2-Lane Road' },
  { id: 'straight4', label: '4-Lane Road' },
  { id: 'tjunction', label: 'T-Junction' },
  { id: 'cross', label: 'Crossroad' },
  { id: 'roundabout', label: 'Roundabout' },
  { id: 'blank', label: 'Blank' },
];

const MIN_ARROW_DISTANCE = 20;

export function AccidentSketch() {
  const navigate = useNavigate();
  const { currentIncident, setSketch } = useAccidentStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState('straight2');
  const [tool, setTool] = useState<ToolType>('pen');
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [undoStack, setUndoStack] = useState<SketchElement[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const penPointsRef = useRef<{ x: number; y: number }[]>([]);
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);
  const [arrowPreview, setArrowPreview] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Derive available car tools from otherParties
  const partyCount = currentIncident?.otherParties?.length ?? 0;
  const carCount = Math.max(2, partyCount + 1); // minimum 2 cars (A + B)
  const availableCars = CAR_PALETTE.slice(0, Math.min(carCount, CAR_PALETTE.length));

  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.min(rect.width * 1.2, 500);
    canvasSize.current = { w: canvas.width, h: canvas.height };

    // Load existing sketch as background if reopening
    if (currentIncident?.sketchDataUrl && !backgroundImgRef.current) {
      const img = new Image();
      img.onload = () => {
        backgroundImgRef.current = img;
        renderCanvas(ctx, canvas.width, canvas.height, template, elements, selectedId, img);
      };
      img.src = currentIncident.sketchDataUrl;
    } else {
      renderCanvas(ctx, canvas.width, canvas.height, template, elements, selectedId, backgroundImgRef.current);
    }
  }, [template, currentIncident?.sketchDataUrl, elements, selectedId]);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  // Re-render canvas when elements, selection, or arrow preview change
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    renderCanvas(ctx, canvas.width, canvas.height, template, elements, selectedId, backgroundImgRef.current);
    // Draw arrow preview on top
    if (arrowPreview) {
      drawArrow(ctx, arrowPreview.x1, arrowPreview.y1, arrowPreview.x2, arrowPreview.y2, { dashed: true, alpha: 0.5 });
    }
  }, [elements, selectedId, template, arrowPreview]);

  if (!currentIncident) { navigate('/'); return null; }

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const pushUndo = () => {
    setUndoStack(prev => [...prev, elements]);
  };

  const addElement = (el: SketchElement) => {
    pushUndo();
    setElements(prev => [...prev, el]);
    setSelectedId(null);
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);

    // Select tool: hit test
    if (tool === 'select') {
      const hit = hitTest(x, y, elements);
      setSelectedId(hit?.id ?? null);
      return;
    }

    // Car tools: stamp immediately
    if (tool.startsWith('car-')) {
      const label = tool.slice(4); // 'car-A' -> 'A'
      const palette = CAR_PALETTE.find(c => c.label === label);
      if (!palette) return;
      addElement({
        id: crypto.randomUUID(),
        type: 'car',
        x, y,
        label: palette.label,
        color: palette.color,
      });
      return;
    }

    // Impact marker: stamp immediately
    if (tool === 'xmarker') {
      addElement({ id: crypto.randomUUID(), type: 'xmarker', x, y });
      return;
    }

    // Arrow: start drag
    if (tool === 'arrow') {
      drawStartRef.current = { x, y };
      setIsDrawing(true);
      setSelectedId(null);
      return;
    }

    // Pen: start stroke
    setIsDrawing(true);
    setSelectedId(null);
    penPointsRef.current = [{ x, y }];
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);

    if (tool === 'pen') {
      penPointsRef.current.push({ x, y });
      // Live pen drawing: render all elements + current stroke
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      renderCanvas(ctx, canvas.width, canvas.height, template, elements, selectedId, backgroundImgRef.current);
      // Draw in-progress stroke
      const pts = penPointsRef.current;
      if (pts.length >= 2) {
        ctx.save();
        ctx.strokeStyle = '#1B2A4A';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    if (tool === 'arrow' && drawStartRef.current) {
      setArrowPreview({ x1: drawStartRef.current.x, y1: drawStartRef.current.y, x2: x, y2: y });
      return;
    }
  };

  const endDraw = (e?: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setArrowPreview(null);

    if (tool === 'arrow' && drawStartRef.current && e) {
      const { x, y } = getPos(e);
      const dx = x - drawStartRef.current.x;
      const dy = y - drawStartRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= MIN_ARROW_DISTANCE) {
        addElement({
          id: crypto.randomUUID(),
          type: 'arrow',
          x1: drawStartRef.current.x, y1: drawStartRef.current.y,
          x2: x, y2: y,
        });
      }
      drawStartRef.current = null;
      return;
    }

    if (tool === 'pen' && penPointsRef.current.length >= 2) {
      addElement({
        id: crypto.randomUUID(),
        type: 'penStroke',
        points: [...penPointsRef.current],
      });
      penPointsRef.current = [];
      return;
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setElements(prev);
    setSelectedId(null);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    pushUndo();
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const clearAll = () => {
    if (elements.length === 0 && !backgroundImgRef.current) return;
    if (!window.confirm('Clear your drawing?')) return;
    pushUndo();
    setElements([]);
    setSelectedId(null);
    backgroundImgRef.current = null;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSketch(canvas.toDataURL('image/png'));
    }
    navigate('/accident/injuries');
  };

  // Build tool palette
  const fixedTools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Select', icon: <MousePointer2 size={14} /> },
    { id: 'pen', label: 'Pen', icon: <Pencil size={14} /> },
  ];

  const carTools = availableCars.map(c => ({
    id: `car-${c.label}` as ToolType,
    label: `Car ${c.label}`,
    icon: <Car size={14} />,
    color: c.color,
  }));

  const otherTools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'arrow', label: 'Direction', icon: <Navigation size={14} /> },
    { id: 'xmarker', label: 'Impact', icon: <X size={14} /> },
  ];

  const getHelpText = () => {
    if (tool === 'select') return 'Tap an element to select it, then delete or move it';
    if (tool === 'pen') return 'Draw with your finger to sketch the accident scene';
    if (tool === 'arrow') return 'Drag to show a vehicle\'s direction of travel';
    if (tool === 'xmarker') return 'Tap the canvas to mark the point of impact';
    if (tool.startsWith('car-')) {
      const label = tool.slice(4);
      const palette = CAR_PALETTE.find(c => c.label === label);
      if (palette) return `Tap the canvas to place Car ${label} (${palette.description})`;
    }
    return '';
  };

  return (
    <StepWizard currentStep={6} totalSteps={8} stepLabel="Accident Sketch" onNext={handleSave}>
      <div className="space-y-4">
        {/* Template selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => {
                if ((elements.length > 0 || backgroundImgRef.current) && !window.confirm('Changing the template will clear your drawing. Continue?')) return;
                setElements([]);
                setUndoStack([]);
                setSelectedId(null);
                backgroundImgRef.current = null;
                setTemplate(t.id);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border-2 transition-colors ${template === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tool palette */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {fixedTools.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); if (t.id !== 'select') setSelectedId(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border-2 transition-colors whitespace-nowrap ${
                tool === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
          {carTools.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedId(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border-2 transition-colors whitespace-nowrap ${
                tool === t.id ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}>
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
          {otherTools.map(t => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedId(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border-2 transition-colors whitespace-nowrap ${
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
          <button onClick={undo} disabled={undoStack.length === 0}
            className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-40">
            <Undo2 size={16} /> Undo
          </button>
          {selectedId ? (
            <button onClick={deleteSelected}
              className="flex-1 py-3 bg-red-50 border-2 border-red-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm text-red-600">
              <Trash2 size={16} /> Delete Selected
            </button>
          ) : (
            <button onClick={clearAll} disabled={elements.length === 0 && !backgroundImgRef.current}
              className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-40">
              <Trash2 size={16} /> Clear
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          {getHelpText()}
        </p>
      </div>
    </StepWizard>
  );
}
