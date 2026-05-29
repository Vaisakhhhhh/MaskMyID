import { useEffect, useRef, useCallback } from 'react';
import type { MaskRect } from '../types/mask.types';
import { drawImage, drawAllMasks, drawMask } from '../utils/drawCanvas';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useAutoDetect } from '../hooks/useAutoDetect';
import { EditorToolbar } from './EditorToolbar';

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
    
    const {
        masks,
        setHistory,
        setHistoryIndex,
        pushHistory,
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,
        handleDelete,
        handleClearAll,
    } = useCanvasHistory();

    const {
        interactionMode,
        selectedMaskId,
        resizeHandle,
        selectedMaskType,
        setSelectedMaskType,
        selectedMaskShape,
        setSelectedMaskShape,
        startPointRef,
        currentPointRef,
        handleStart,
        handleMove,
        handleEnd,
        setSelectedMaskId
    } = useCanvasInteraction(canvasRef, masks, pushHistory, () => redrawCanvas());

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
                    shape: selectedMaskShape,
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
    }, [masks, interactionMode, selectedMaskId, selectedMaskType, resizeHandle, startPointRef, currentPointRef]);

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

    // Apply auto-detect OCR side-effect
    useAutoDetect(imageUrl, setHistory, setHistoryIndex);

    useEffect(() => {
        redrawCanvas();
    }, [masks, interactionMode, selectedMaskId, selectedMaskType, resizeHandle, redrawCanvas]);

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
                handleDelete(selectedMaskId);
                setSelectedMaskId(null);
            } else if (e.key === 'Escape') {
                setSelectedMaskId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo, handleDelete, selectedMaskId, setSelectedMaskId]);

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
            <EditorToolbar
                selectedMaskType={selectedMaskType}
                setSelectedMaskType={setSelectedMaskType}
                selectedMaskShape={selectedMaskShape}
                setSelectedMaskShape={setSelectedMaskShape}
                canUndo={canUndo}
                canRedo={canRedo}
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                hasSelection={!!selectedMaskId}
                handleDelete={() => {
                    handleDelete(selectedMaskId);
                    setSelectedMaskId(null);
                }}
                handleClearAll={handleClearAll}
                handleExport={handleExport}
                onRemoveImage={onRemoveImage}
            />
            
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