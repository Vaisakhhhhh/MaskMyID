import { useEffect, useRef, useState, useCallback } from 'react';
import type { MaskRect, MaskType } from '../types/mask.types';
import { drawImage, drawAllMasks, drawMask } from '../utils/drawCanvas';

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

    const [isDrawing, setIsDrawing] = useState(false);
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

    const redrawCanvas = useCallback((showBorders: boolean = true) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const image = imageRef.current;
        
        if (!canvas || !ctx || !image) return;

        drawImage(ctx, image, canvas);
        drawAllMasks(ctx, masks, showBorders);
        
        if (isDrawing && showBorders) {
            const start = startPointRef.current;
            const end = currentPointRef.current;
            const previewMask: MaskRect = {
                id: 'preview',
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y),
                type: selectedMaskType,
            };
            drawMask(ctx, previewMask, true);
        }
    }, [masks, isDrawing, selectedMaskType]);

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

    useEffect(() => {
        redrawCanvas();
    }, [masks, isDrawing, selectedMaskType, redrawCanvas]);

    const handleUndo = useCallback(() => {
        setHistoryIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const handleRedo = useCallback(() => {
        setHistoryIndex((prev) => Math.min(history.length - 1, prev + 1));
    }, [history.length]);

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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const handleStart = (clientX: number, clientY: number) => {
        const point = getCanvasCoordinates(clientX, clientY);
        startPointRef.current = point;
        currentPointRef.current = point;
        setIsDrawing(true);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDrawing) return;
        currentPointRef.current = getCanvasCoordinates(clientX, clientY);
        redrawCanvas();
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        
        const start = startPointRef.current;
        const end = currentPointRef.current;
        
        const newMask: MaskRect = {
            id: crypto.randomUUID(),
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            width: Math.abs(end.x - start.x),
            height: Math.abs(end.y - start.y),
            type: selectedMaskType,
        };
        
        if (newMask.width > 5 && newMask.height > 5) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push([...masks, newMask]);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
        
        setIsDrawing(false);
    };

    const handleClearAll = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => handleStart(e.clientX, e.clientY);
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleMouseLeave = () => { if (isDrawing) handleEnd(); };

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
        
        // Redraw without borders for export
        redrawCanvas(false);
        
        const link = document.createElement('a');
        link.download = 'masked-document.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restore borders
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
                    onClick={handleClearAll}
                    className="rounded-lg bg-zinc-800 px-4 py-2"
                >
                    Clear All
                </button>
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
                className="max-w-full rounded-2xl border border-zinc-800 cursor-crosshair touch-none"
            />
        </>
    );
}