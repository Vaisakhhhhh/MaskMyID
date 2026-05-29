export type MaskType = 'black' | 'pixelate' | 'blur';

export type MaskShape = 'rectangle' | 'circle';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export interface MaskRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MaskType;
  shape: MaskShape;
}