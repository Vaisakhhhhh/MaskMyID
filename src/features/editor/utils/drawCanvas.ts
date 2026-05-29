import type { MaskRect } from '../types/mask.types';
import { pixelateRegion } from './pixelate';

export const HANDLE_SIZE = 10;

export function drawImage(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    canvas: HTMLCanvasElement
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
}

export function drawMask(
    ctx: CanvasRenderingContext2D,
    mask: MaskRect,
    showBorder: boolean = true,
    isSelected: boolean = false
) {
    if (mask.width === 0 || mask.height === 0) return;

    ctx.save();
    
    switch (mask.type) {
        case 'black':
            ctx.fillStyle = '#000';
            ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
            break;

        case 'pixelate':
            pixelateRegion(ctx, mask.x, mask.y, mask.width, mask.height);
            break;

        case 'blur':
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = mask.width;
            tempCanvas.height = mask.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.filter = 'blur(10px)';
                tempCtx.drawImage(
                    ctx.canvas, 
                    mask.x, mask.y, mask.width, mask.height, 
                    0, 0, mask.width, mask.height
                );
                ctx.drawImage(tempCanvas, mask.x, mask.y);
            }
            break;
    }

    if (showBorder) {
        ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(107, 114, 128, 0.5)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(mask.x, mask.y, mask.width, mask.height);
        
        if (isSelected) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            
            const handles = [
                { x: mask.x - HANDLE_SIZE/2, y: mask.y - HANDLE_SIZE/2 }, // nw
                { x: mask.x + mask.width - HANDLE_SIZE/2, y: mask.y - HANDLE_SIZE/2 }, // ne
                { x: mask.x - HANDLE_SIZE/2, y: mask.y + mask.height - HANDLE_SIZE/2 }, // sw
                { x: mask.x + mask.width - HANDLE_SIZE/2, y: mask.y + mask.height - HANDLE_SIZE/2 }, // se
            ];
            
            handles.forEach(h => {
                ctx.fillRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
                ctx.strokeRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
            });
        }
    }
    
    ctx.restore();
}

export function drawAllMasks(
    ctx: CanvasRenderingContext2D,
    masks: MaskRect[],
    showBorder: boolean = true,
    selectedMaskId: string | null = null
) {
    masks.forEach(mask => drawMask(ctx, mask, showBorder, mask.id === selectedMaskId));
}