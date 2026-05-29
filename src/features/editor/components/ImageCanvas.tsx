import { useEffect, useRef, useState, useCallback } from 'react';
import type { MaskRect, MaskType, ResizeHandle } from '../types/mask.types';
import { drawImage, drawAllMasks, drawMask, HANDLE_SIZE } from '../utils/drawCanvas';
import { autoDetectMasks } from '../utils/ocrDetector';

interface ImageCanvasProps {
    imageUrl: string;
    onRemoveImage: () => void;
}

export function ImageCanvas({
    imageUrl,
    onRemoveImage,
}: ImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    
    const [history, setHistory] = useState<MaskRect[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const masks = history[historyIndex];

    const [interactionMode, setInteractionMode] = useState<'idle' | 'drawing' | 'moving' | 'resizing'>('idle');
    const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
    const [selectedMaskType, setSelectedMaskType] = useState<MaskType>('black');
    
    const startPointRef = useRef({ x: 0, y: 0 });
    const currentPointRef = useRef({ x: 0, y: 0 });

    const getCanvasCoordinates = (
        clientX: number, clientY: number
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const getHitResult = (x: number, y: number, masksList: MaskRect[]) => {
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
    };

    const redrawCanvas = useCallback((showBorders: boolean = true) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const image = imageRef.current;
        
        if (!canvas || !ctx || !image) return;

        drawImage(ctx, image, canvas);
        
        const activeMasks = masks.filter(m => !(interactionMode !== 'idle' && interactionMode !== 'drawing' && m.id === selectedMaskId));
        drawAllMasks(ctx, activeMasks, showBorders, selectedMaskId);
        
        if (interactionMode !== 'idle' && showBorders) {
            const start = startPointRef.current;
            const end = currentPointRef.current;
            
            if (interactionMode === 'drawing') {
                const previewMask: MaskRect = {
                    id: 'preview',
                    x: Math.min(start.x, end.x),
                    y: Math.min(start.y, end.y),
                    width: Math.abs(end.x - start.x),
                    height: Math.abs(end.y - start.y),
                    type: selectedMaskType,
                };
                drawMask(ctx, previewMask, true, true);
            } else if (selectedMaskId) {
                const selected = masks.find(m => m.id === selectedMaskId);
                if (selected) {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    let preview = { ...selected };
                    
                    if (interactionMode === 'moving') {
                        preview.x += dx;
                        preview.y += dy;
                    } else if (interactionMode === 'resizing' && resizeHandle) {
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
                    }
                    drawMask(ctx, preview, true, true);
                }
            }
        }
    }, [masks, interactionMode, selectedMaskId, selectedMaskType, resizeHandle]);

    useEffect(() => {
        const image = new Image();
        image.onload = () => {
            imageRef.current = image;
            if (canvasRef.current) {
                canvasRef.current.width = image.width;
                canvasRef.current.height = image.height;
                redrawCanvas();
            }
        };
        image.src = imageUrl;
    }, [imageUrl, redrawCanvas]);

    const autoDetectAttemptedRef = useRef<string | null>(null);
    
    useEffect(() => {
        if (autoDetectAttemptedRef.current === imageUrl) return;
        autoDetectAttemptedRef.current = imageUrl;
        
        let isMounted = true;
        
        const detect = async () => {
            try {
                // By default, auto-detected masks will be black
                const detectedMasks = await autoDetectMasks(imageUrl, 'black');
                if (!isMounted) return;
                
                if (detectedMasks.length > 0) {
                    setHistory(prev => {
                        const currentMasks = prev[prev.length - 1] || [];
                        const newMasks = [...currentMasks];
                        for (const m of detectedMasks) {
                            newMasks.push({
                                ...m,
                                id: crypto.randomUUID()
                            });
                        }
                        return [...prev, newMasks];
                    });
                    setHistoryIndex(prev => prev + 1);
                }
            } catch (error) {
                console.error("OCR Auto-detect failed:", error);
            }
        };
        
        detect();
        
        return () => { 
            isMounted = false; 
            if (autoDetectAttemptedRef.current === imageUrl) {
                autoDetectAttemptedRef.current = null;
            }
        };
    }, [imageUrl]);

    useEffect(() => {
        redrawCanvas();
    }, [masks, interactionMode, selectedMaskId, selectedMaskType, resizeHandle, redrawCanvas]);

    const handleUndo = useCallback(() => {
        setHistoryIndex((prev) => Math.max(0, prev - 1));
        setSelectedMaskId(null);
    }, []);

    const handleRedo = useCallback(() => {
        setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
        setSelectedMaskId(null);
    }, [history.length]);

    const handleDelete = useCallback(() => {
        if (selectedMaskId) {
            const newMasks = masks.filter(m => m.id !== selectedMaskId);
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newMasks);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setSelectedMaskId(null);
        }
    }, [masks, selectedMaskId, history, historyIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        handleRedo();
                    } else {
                        handleUndo();
                    }
                } else if (e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    handleRedo();
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleDelete();
            } else if (e.key === 'Escape') {
                setSelectedMaskId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDelete]);

    const handleStart = (clientX: number, clientY: number) => {
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
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (interactionMode === 'idle') return;
        currentPointRef.current = getCanvasCoordinates(clientX, clientY);
        redrawCanvas();
    };

    const handleEnd = () => {
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
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newMasks);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        
        setInteractionMode('idle');
        setResizeHandle(null);
    };

    const handleClearAll = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setSelectedMaskId(null);
    };



    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => handleStart(e.clientX, e.clientY);
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleMouseLeave = () => { if (interactionMode !== 'idle') handleEnd(); };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };
    
    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        handleEnd();
    };

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        redrawCanvas(false);
        
        const link = document.createElement('a');
        link.download = 'masked-document.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        redrawCanvas(true);
    };

    return (
        <>
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedMaskType('black')}
                    className={`rounded-lg px-4 py-2 ${selectedMaskType === 'black' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                >
                    Black
                </button>
                <button
                    onClick={() => setSelectedMaskType('pixelate')}
                    className={`rounded-lg px-4 py-2 ${selectedMaskType === 'pixelate' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                >
                    Pixelate
                </button>
                <button
                    onClick={() => setSelectedMaskType('blur')}
                    className={`rounded-lg px-4 py-2 ${selectedMaskType === 'blur' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
                >
                    Blur
                </button>
                <div className="mx-2 w-px bg-zinc-800"></div>
                <button
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    className={`rounded-lg px-4 py-2 ${historyIndex === 0 ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800'}`}
                >
                    Undo
                </button>
                <button
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    className={`rounded-lg px-4 py-2 ${historyIndex === history.length - 1 ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800'}`}
                >
                    Redo
                </button>
                <div className="mx-2 w-px bg-zinc-800"></div>
                <button
                    onClick={handleDelete}
                    disabled={!selectedMaskId}
                    className={`rounded-lg px-4 py-2 ${!selectedMaskId ? 'bg-zinc-800/50 text-zinc-500' : 'bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white'}`}
                >
                    Delete Selected
                </button>
                <button
                    onClick={handleClearAll}
                    className="rounded-lg bg-zinc-800 px-4 py-2"
                >
                    Clear All
                </button>

                <div className="mx-2 w-px bg-zinc-800"></div>
                <button
                    onClick={handleExport}
                    className="rounded-lg bg-blue-600 px-4 py-2"
                >
                    Export Image
                </button>
                <button
                    onClick={onRemoveImage}
                    className="rounded-lg bg-red-600 px-4 py-2"
                >
                    Remove Image
                </button>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`max-w-full rounded-2xl border border-zinc-800 touch-none ${
                    interactionMode === 'moving' ? 'cursor-move' : 
                    interactionMode === 'resizing' ? 'cursor-nwse-resize' : 
                    selectedMaskId ? 'cursor-default' : 'cursor-crosshair'
                }`}
            />
        </>
    );
}