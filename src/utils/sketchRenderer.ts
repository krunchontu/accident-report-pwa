import type { SketchElement } from '../types/sketch';

// --- Template drawing ---

export function drawTemplate(ctx: CanvasRenderingContext2D, template: string, w: number, h: number) {
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2, cy = h / 2;
  const roadW = 80;

  if (template === 'straight2' || template === 'straight4') {
    const lanes = template === 'straight2' ? 2 : 4;
    const totalW = roadW * lanes / 2;
    ctx.fillStyle = '#ddd';
    ctx.fillRect(cx - totalW, 0, totalW * 2, h);
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
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
    ctx.setLineDash([10, 10]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, h); ctx.stroke();
    ctx.setLineDash([]);
  } else if (template === 'cross') {
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, cy - roadW, w, roadW * 2);
    ctx.fillRect(cx - roadW, 0, roadW * 2, h);
    ctx.setLineDash([10, 10]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
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

// --- Element drawing ---

export function drawCarShape(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  const w = 24, h = 44;
  ctx.save();
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

export function drawXMarker(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = 10;
  ctx.save();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
  ctx.restore();
}

export function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, style?: { dashed?: boolean; alpha?: number }) {
  const headLen = 12;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = '#1B2A4A';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  if (style?.alpha !== undefined) ctx.globalAlpha = style.alpha;
  if (style?.dashed) ctx.setLineDash([6, 4]);
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

export function drawPenStroke(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = '#1B2A4A';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

// --- Selection indicator ---

function drawSelectionIndicator(ctx: CanvasRenderingContext2D, element: SketchElement) {
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);

  switch (element.type) {
    case 'car': {
      const w = 24, h = 44, pad = 4;
      ctx.strokeRect(element.x - w / 2 - pad, element.y - h / 2 - pad, w + pad * 2, h + pad * 2);
      break;
    }
    case 'xmarker': {
      const r = 16;
      ctx.beginPath();
      ctx.arc(element.x, element.y, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'arrow': {
      const pad = 8;
      const minX = Math.min(element.x1, element.x2) - pad;
      const minY = Math.min(element.y1, element.y2) - pad;
      const maxX = Math.max(element.x1, element.x2) + pad;
      const maxY = Math.max(element.y1, element.y2) + pad;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      break;
    }
    case 'penStroke': {
      if (element.points.length === 0) break;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of element.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const pad = 6;
      ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2);
      break;
    }
  }
  ctx.restore();
}

// --- Full canvas render ---

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  template: string,
  elements: SketchElement[],
  selectedId: string | null,
  backgroundImage?: HTMLImageElement | null,
) {
  ctx.clearRect(0, 0, w, h);
  drawTemplate(ctx, template, w, h);

  // Draw previously saved sketch as background
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, w, h);
  }

  for (const el of elements) {
    switch (el.type) {
      case 'car':
        drawCarShape(ctx, el.x, el.y, el.color, el.label);
        break;
      case 'arrow':
        drawArrow(ctx, el.x1, el.y1, el.x2, el.y2);
        break;
      case 'xmarker':
        drawXMarker(ctx, el.x, el.y);
        break;
      case 'penStroke':
        drawPenStroke(ctx, el.points);
        break;
    }
    if (el.id === selectedId) {
      drawSelectionIndicator(ctx, el);
    }
  }
}

// --- Hit testing ---

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function hitTest(x: number, y: number, elements: SketchElement[]): SketchElement | null {
  // Check in reverse order (top-most first)
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    switch (el.type) {
      case 'car': {
        const hw = 12, hh = 22; // half width/height
        if (x >= el.x - hw - 4 && x <= el.x + hw + 4 && y >= el.y - hh - 4 && y <= el.y + hh + 4) {
          return el;
        }
        break;
      }
      case 'xmarker': {
        if (Math.hypot(x - el.x, y - el.y) < 16) return el;
        break;
      }
      case 'arrow': {
        if (distToSegment(x, y, el.x1, el.y1, el.x2, el.y2) < 12) return el;
        break;
      }
      case 'penStroke': {
        for (let j = 1; j < el.points.length; j++) {
          if (distToSegment(x, y, el.points[j - 1].x, el.points[j - 1].y, el.points[j].x, el.points[j].y) < 10) {
            return el;
          }
        }
        break;
      }
    }
  }
  return null;
}
