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
    
    if (mask.shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(
            mask.x + mask.width / 2, 
            mask.y + mask.height / 2, 
            mask.width / 2, 
            mask.height / 2, 
            0, 0, 2 * Math.PI
        );
        ctx.clip();
    }
    
    switch (mask.type) {
        case 'black':
            ctx.fillStyle = '#000';
            ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
            break;

        case 'pixelate':
            pixelateRegion(ctx, mask.x, mask.y, mask.width, mask.height);
            break;

        case 'blur': {
            const w = Math.max(1, Math.floor(mask.width));
            const h = Math.max(1, Math.floor(mask.height));
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.filter = 'blur(10px)';
                tempCtx.drawImage(
                    ctx.canvas, 
                    mask.x, mask.y, mask.width, mask.height, 
                    0, 0, w, h
                );
                ctx.drawImage(tempCanvas, mask.x, mask.y, mask.width, mask.height);
            }
            break;
        }
    }

    ctx.restore(); // Restore clipping path

    if (showBorder) {
        ctx.save(); // Save state for border
        const scale = ctx.canvas && ctx.canvas.clientWidth > 0 ? ctx.canvas.width / ctx.canvas.clientWidth : 1;
        ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(107, 114, 128, 0.5)';
        ctx.lineWidth = (isSelected ? 2 : 1) * scale;
        
        if (mask.shape === 'circle') {
            ctx.beginPath();
            ctx.ellipse(
                mask.x + mask.width / 2, 
                mask.y + mask.height / 2, 
                mask.width / 2, 
                mask.height / 2, 
                0, 0, 2 * Math.PI
            );
            ctx.stroke();
        } else {
            ctx.strokeRect(mask.x, mask.y, mask.width, mask.height);
        }
        
        if (isSelected) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2 * scale;
            
            const scaledHandleSize = HANDLE_SIZE * scale;
            const handleHalf = scaledHandleSize / 2;
            
            const handles = [
                { x: mask.x - handleHalf, y: mask.y - handleHalf }, // nw
                { x: mask.x + mask.width - handleHalf, y: mask.y - handleHalf }, // ne
                { x: mask.x - handleHalf, y: mask.y + mask.height - handleHalf }, // sw
                { x: mask.x + mask.width - handleHalf, y: mask.y + mask.height - handleHalf }, // se
            ];
            
            handles.forEach(h => {
                ctx.fillRect(h.x, h.y, scaledHandleSize, scaledHandleSize);
                ctx.strokeRect(h.x, h.y, scaledHandleSize, scaledHandleSize);
            });
        }
        ctx.restore(); // Restore border state
    }
}

export function drawAllMasks(
    ctx: CanvasRenderingContext2D,
    masks: MaskRect[],
    showBorder: boolean = true,
    selectedMaskId: string | null = null
) {
    masks.forEach(mask => drawMask(ctx, mask, showBorder, mask.id === selectedMaskId));
}