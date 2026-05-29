import { useState, useRef, useCallback } from 'react';
import type { MaskRect, MaskType, ResizeHandle } from '../types/mask.types';
import { HANDLE_SIZE } from '../utils/drawCanvas';

export type InteractionMode = 'idle' | 'drawing' | 'moving' | 'resizing';

export function useCanvasInteraction(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    masks: MaskRect[],
    pushHistory: (newMasks: MaskRect[]) => void,
    redrawCanvas: () => void
) {
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
    const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
    const [selectedMaskType, setSelectedMaskType] = useState<MaskType>('black');
    
    const startPointRef = useRef({ x: 0, y: 0 });
    const currentPointRef = useRef({ x: 0, y: 0 });

    const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, [canvasRef]);

    const getHitResult = useCallback((x: number, y: number, masksList: MaskRect[]) => {
        if (selectedMaskId) {
            const selected = masksList.find(m => m.id === selectedMaskId);
            if (selected) {
                const HANDLE_HALF = HANDLE_SIZE / 2;
                const handles: { type: ResizeHandle; hx: number; hy: number }[] = [
                    { type: 'nw', hx: selected.x, hy: selected.y },
                    { type: 'ne', hx: selected.x + selected.width, hy: selected.y },
                    { type: 'sw', hx: selected.x, hy: selected.y + selected.height },
                    { type: 'se', hx: selected.x + selected.width, hy: selected.y + selected.height },
                ];
                
                for (const h of handles) {
                    if (
                        x >= h.hx - HANDLE_HALF && x <= h.hx + HANDLE_HALF &&
                        y >= h.hy - HANDLE_HALF && y <= h.hy + HANDLE_HALF
                    ) {
                        return { type: 'handle', handle: h.type, mask: selected };
                    }
                }
            }
        }
        
        for (let i = masksList.length - 1; i >= 0; i--) {
            const m = masksList[i];
            if (x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) {
                return { type: 'mask', mask: m };
            }
        }
        
        return { type: 'empty' };
    }, [selectedMaskId]);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        const point = getCanvasCoordinates(clientX, clientY);
        startPointRef.current = point;
        currentPointRef.current = point;
        
        const hit = getHitResult(point.x, point.y, masks);
        
        if (hit.type === 'handle' && 'handle' in hit) {
            setInteractionMode('resizing');
            setResizeHandle(hit.handle as ResizeHandle);
        } else if (hit.type === 'mask' && 'mask' in hit) {
            setSelectedMaskId((hit.mask as MaskRect).id);
            setInteractionMode('moving');
        } else {
            setSelectedMaskId(null);
            setInteractionMode('drawing');
        }
    }, [getCanvasCoordinates, getHitResult, masks]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (interactionMode === 'idle') return;
        currentPointRef.current = getCanvasCoordinates(clientX, clientY);
        redrawCanvas();
    }, [interactionMode, getCanvasCoordinates, redrawCanvas]);

    const handleEnd = useCallback(() => {
        if (interactionMode === 'idle') return;
        
        const start = startPointRef.current;
        const end = currentPointRef.current;
        
        let newMasks = [...masks];
        let stateChanged = false;
        
        if (interactionMode === 'drawing') {
            const newMask: MaskRect = {
                id: crypto.randomUUID(),
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
                type: selectedMaskType,
            };
            
            if (newMask.width > 5 && newMask.height > 5) {
                newMasks.push(newMask);
                setSelectedMaskId(newMask.id);
                stateChanged = true;
            }
        } else if (selectedMaskId) {
            const selectedIdx = newMasks.findIndex(m => m.id === selectedMaskId);
            if (selectedIdx !== -1) {
                const selected = newMasks[selectedIdx];
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                let preview = { ...selected };
                
                if (interactionMode === 'moving') {
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        preview.x += dx;
                        preview.y += dy;
                        stateChanged = true;
                    }
                } else if (interactionMode === 'resizing' && resizeHandle) {
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        if (resizeHandle.includes('n')) { preview.y += dy; preview.height -= dy; }
                        if (resizeHandle.includes('s')) { preview.height += dy; }
                        if (resizeHandle.includes('w')) { preview.x += dx; preview.width -= dx; }
                        if (resizeHandle.includes('e')) { preview.width += dx; }
                        
                        if (preview.width < 5) {
                            if (resizeHandle.includes('w')) preview.x += (preview.width - 5);
                            preview.width = 5;
                        }
                        if (preview.height < 5) {
                            if (resizeHandle.includes('n')) preview.y += (preview.height - 5);
                            preview.height = 5;
                        }
                        stateChanged = true;
                    }
                }
                newMasks[selectedIdx] = preview;
            }
        }
        
        if (stateChanged) {
            pushHistory(newMasks);
        }
        
        setInteractionMode('idle');
        setResizeHandle(null);
    }, [interactionMode, masks, selectedMaskType, selectedMaskId, resizeHandle, pushHistory]);

    return {
        interactionMode,
        selectedMaskId,
        setSelectedMaskId,
        resizeHandle,
        selectedMaskType,
        setSelectedMaskType,
        startPointRef,
        currentPointRef,
        handleStart,
        handleMove,
        handleEnd
    };
}
