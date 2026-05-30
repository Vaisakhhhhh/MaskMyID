import { useState, useRef, useCallback, useEffect } from 'react';
import type { MaskRect, MaskType, MaskShape, ResizeHandle } from '../types/mask.types';
import { HANDLE_SIZE } from '../utils/drawCanvas';

export type InteractionMode = 'idle' | 'drawing' | 'moving' | 'resizing';

const generateId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);
};

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
    const [selectedMaskShape, setSelectedMaskShape] = useState<MaskShape>('rectangle');
    
    const startPointRef = useRef({ x: 0, y: 0 });
    const currentPointRef = useRef({ x: 0, y: 0 });

    // Keep refs in sync with state so touch callbacks always read fresh values
    const masksRef = useRef(masks);
    const selectedMaskIdRef = useRef<string | null>(null);
    const interactionModeRef = useRef<InteractionMode>('idle');
    const resizeHandleRef = useRef<ResizeHandle | null>(null);
    const selectedMaskTypeRef = useRef<MaskType>('black');
    const selectedMaskShapeRef = useRef<MaskShape>('rectangle');
    const pushHistoryRef = useRef(pushHistory);
    const redrawCanvasRef = useRef(redrawCanvas);

    useEffect(() => { masksRef.current = masks; }, [masks]);
    useEffect(() => { pushHistoryRef.current = pushHistory; }, [pushHistory]);
    useEffect(() => { redrawCanvasRef.current = redrawCanvas; }, [redrawCanvas]);

    const setInteractionModeSynced = useCallback((mode: InteractionMode) => {
        setInteractionMode(mode);
        interactionModeRef.current = mode;
    }, []);

    const setSelectedMaskIdSynced = useCallback((id: string | null) => {
        setSelectedMaskId(id);
        selectedMaskIdRef.current = id;
    }, []);

    const setResizeHandleSynced = useCallback((handle: ResizeHandle | null) => {
        setResizeHandle(handle);
        resizeHandleRef.current = handle;
    }, []);

    const setSelectedMaskTypeSynced = useCallback((type: MaskType) => {
        setSelectedMaskType(type);
        selectedMaskTypeRef.current = type;
    }, []);

    const setSelectedMaskShapeSynced = useCallback((shape: MaskShape) => {
        setSelectedMaskShape(shape);
        selectedMaskShapeRef.current = shape;
    }, []);

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

    const getHitResult = useCallback((x: number, y: number) => {
        const currentSelectedId = selectedMaskIdRef.current;
        const masksList = masksRef.current;

        if (currentSelectedId) {
            const selected = masksList.find(m => m.id === currentSelectedId);
            if (selected) {
                const canvas = canvasRef.current;
                const scale = canvas && canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
                // Use a larger hit area (2.5x) for easier touch interaction on mobile
                const HANDLE_HALF = (HANDLE_SIZE * scale * 2.5) / 2;
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
                        return { type: 'handle' as const, handle: h.type, mask: selected };
                    }
                }

                // Also check if touch is inside the selected mask body (for moving)
                if (x >= selected.x && x <= selected.x + selected.width &&
                    y >= selected.y && y <= selected.y + selected.height) {
                    return { type: 'mask' as const, mask: selected };
                }
            }
        }
        
        for (let i = masksList.length - 1; i >= 0; i--) {
            const m = masksList[i];
            if (x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) {
                return { type: 'mask' as const, mask: m };
            }
        }
        
        return { type: 'empty' as const };
    }, [canvasRef]);

    // All handlers read from refs — never stale
    const handleStart = useCallback((clientX: number, clientY: number) => {
        const point = getCanvasCoordinates(clientX, clientY);
        startPointRef.current = point;
        currentPointRef.current = point;
        
        const hit = getHitResult(point.x, point.y);
        
        if (hit.type === 'handle') {
            setInteractionModeSynced('resizing');
            setResizeHandleSynced(hit.handle);
        } else if (hit.type === 'mask') {
            setSelectedMaskIdSynced(hit.mask.id);
            setInteractionModeSynced('moving');
        } else {
            setSelectedMaskIdSynced(null);
            setInteractionModeSynced('drawing');
        }
    }, [getCanvasCoordinates, getHitResult, setInteractionModeSynced, setResizeHandleSynced, setSelectedMaskIdSynced]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (interactionModeRef.current === 'idle') return;
        currentPointRef.current = getCanvasCoordinates(clientX, clientY);
        redrawCanvasRef.current();
    }, [getCanvasCoordinates]);

    const handleEnd = useCallback(() => {
        const mode = interactionModeRef.current;
        if (mode === 'idle') return;
        
        const start = startPointRef.current;
        const end = currentPointRef.current;
        const currentMasks = masksRef.current;
        const currentSelectedId = selectedMaskIdRef.current;
        const currentResizeHandle = resizeHandleRef.current;
        
        let newMasks = [...currentMasks];
        let stateChanged = false;
        
        if (mode === 'drawing') {
            const newMask: MaskRect = {
                id: generateId(),
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
                type: selectedMaskTypeRef.current,
                shape: selectedMaskShapeRef.current,
            };
            
            if (newMask.width > 5 && newMask.height > 5) {
                newMasks.push(newMask);
                setSelectedMaskIdSynced(newMask.id);
                stateChanged = true;
            }
        } else if (currentSelectedId) {
            const selectedIdx = newMasks.findIndex(m => m.id === currentSelectedId);
            if (selectedIdx !== -1) {
                const selected = newMasks[selectedIdx];
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                let preview = { ...selected };
                
                if (mode === 'moving') {
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        preview.x += dx;
                        preview.y += dy;
                        stateChanged = true;
                    }
                } else if (mode === 'resizing' && currentResizeHandle) {
                    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                        if (currentResizeHandle.includes('n')) { preview.y += dy; preview.height -= dy; }
                        if (currentResizeHandle.includes('s')) { preview.height += dy; }
                        if (currentResizeHandle.includes('w')) { preview.x += dx; preview.width -= dx; }
                        if (currentResizeHandle.includes('e')) { preview.width += dx; }
                        
                        if (preview.width < 5) {
                            if (currentResizeHandle.includes('w')) preview.x += (preview.width - 5);
                            preview.width = 5;
                        }
                        if (preview.height < 5) {
                            if (currentResizeHandle.includes('n')) preview.y += (preview.height - 5);
                            preview.height = 5;
                        }
                        stateChanged = true;
                    }
                }
                newMasks[selectedIdx] = preview;
            }
        }
        
        if (stateChanged) {
            pushHistoryRef.current(newMasks);
        }
        
        setInteractionModeSynced('idle');
        setResizeHandleSynced(null);
    }, [setInteractionModeSynced, setResizeHandleSynced, setSelectedMaskIdSynced]);

    return {
        interactionMode,
        selectedMaskId,
        setSelectedMaskId: setSelectedMaskIdSynced,
        resizeHandle,
        selectedMaskType,
        setSelectedMaskType: setSelectedMaskTypeSynced,
        selectedMaskShape,
        setSelectedMaskShape: setSelectedMaskShapeSynced,
        startPointRef,
        currentPointRef,
        handleStart,
        handleMove,
        handleEnd
    };
}
