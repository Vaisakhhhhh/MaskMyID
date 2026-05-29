export type MaskType = 'black' | 'blur' | 'pixelate';

export interface MaskRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MaskType;
}