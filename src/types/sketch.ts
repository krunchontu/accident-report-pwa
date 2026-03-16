export type ToolType = 'select' | 'pen' | 'arrow' | 'xmarker' | `car-${string}`;

interface SketchElementBase {
  id: string;
  type: string;
}

export interface CarElement extends SketchElementBase {
  type: 'car';
  x: number;
  y: number;
  label: string;
  color: string;
}

export interface ArrowElement extends SketchElementBase {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  carLabel: string;
  color: string;
}

export interface XMarkerElement extends SketchElementBase {
  type: 'xmarker';
  x: number;
  y: number;
}

export interface PenStrokeElement extends SketchElementBase {
  type: 'penStroke';
  points: { x: number; y: number }[];
}

export type SketchElement = CarElement | ArrowElement | XMarkerElement | PenStrokeElement;

export interface CarPaletteEntry {
  label: string;
  color: string;
  description: string;
}

export const CAR_PALETTE: CarPaletteEntry[] = [
  { label: 'A', color: '#2563eb', description: 'Your Car' },
  { label: 'B', color: '#dc2626', description: 'Other Party 1' },
  { label: 'C', color: '#16a34a', description: 'Other Party 2' },
  { label: 'D', color: '#ea580c', description: 'Other Party 3' },
  { label: 'E', color: '#9333ea', description: 'Other Party 4' },
  { label: 'F', color: '#0891b2', description: 'Other Party 5' },
];
