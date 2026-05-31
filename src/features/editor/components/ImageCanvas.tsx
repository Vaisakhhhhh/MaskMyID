import { useEffect, useRef, useCallback, useState } from 'react';
import type { MaskRect } from '../types/mask.types';
import { drawImage, drawAllMasks, drawMask } from '../utils/drawCanvas';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { useAutoDetect } from '../hooks/useAutoDetect';
import { EditorToolbar } from './EditorToolbar';
import { Trash2, Download, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCanvasProps {
    imageUrl: string;
    onRemoveImage: () => void;
    onGoHome: () => void;
}

export function ImageCanvas({
    imageUrl,
    onRemoveImage,
    onGoHome,
}: ImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);

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
                
                // Use setTimeout to allow browser to calculate layout with CSS max- dimensions first
                setTimeout(() => {
                    if (canvasRef.current) {
                        const rect = canvasRef.current.getBoundingClientRect();
                        setBaseSize({ width: rect.width, height: rect.height });
                    }
                }, 0);
            }
        };
        image.src = imageUrl;
    }, [imageUrl]); // ONLY run when imageUrl changes!

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
        link.download = `masked-document-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        redrawCanvas(true);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex-shrink-0 z-10">
                <div className="flex flex-col">
                    <h1 className="text-lg sm:text-xl font-bold cursor-pointer tracking-tight text-white flex items-center gap-2 hover:opacity-80 transition" onClick={onGoHome}>
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> MaskMyID <span className="hidden sm:inline-block text-xs font-normal bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">v1.0</span>
                    </h1>
                    <p className="text-xs text-zinc-400 hidden sm:block">Privacy-first document masking. Your files never leave your device.</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={onRemoveImage}
                        className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                        <span className="hidden sm:inline">Remove Image</span>
                        <span className="sm:hidden">Remove</span>
                    </button>
                    <button onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md shadow-blue-600/10 cursor-pointer">
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Export Image</span>
                        <span className="sm:hidden">Export</span>
                    </button>
                </div>
            </header>

            <main className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
                <EditorToolbar
                    selectedMaskType={selectedMaskType}
                    setSelectedMaskType={(type) => {
                        setSelectedMaskType(type);
                        if (selectedMaskId) {
                            const newMasks = masks.map(m => m.id === selectedMaskId ? { ...m, type } : m);
                            pushHistory(newMasks);
                        }
                    }}
                    selectedMaskShape={selectedMaskShape}
                    setSelectedMaskShape={(shape) => {
                        setSelectedMaskShape(shape);
                        if (selectedMaskId) {
                            const newMasks = masks.map(m => m.id === selectedMaskId ? { ...m, shape } : m);
                            pushHistory(newMasks);
                        }
                    }}
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
                />

                <div className="flex-1 relative flex flex-col min-w-0 bg-zinc-950 order-1 lg:order-2 min-h-0">
                    <section className="flex-1 overflow-auto">
                        <div className="min-w-full min-h-full w-max h-max flex items-center justify-center p-4 sm:p-6">
                            <div className="relative max-h-full max-w-[100vw] lg:max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/20 shadow-2xl p-1.5 sm:p-2 group" style={zoom !== 1 ? { maxHeight: 'none', maxWidth: 'none' } : undefined}>
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseLeave}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className={`rounded-xl object-contain shadow-lg block touch-none ${
                                        zoom === 1 ? 'max-h-[40vh] lg:max-h-[70vh] max-w-full' : ''
                                    } ${
                                        interactionMode === 'moving' ? 'cursor-move' :
                                        interactionMode === 'resizing' ? 'cursor-nwse-resize' :
                                        selectedMaskId ? 'cursor-default' : 'cursor-crosshair'
                                    }`}
                                    style={zoom !== 1 && baseSize ? { width: baseSize.width * zoom, height: baseSize.height * zoom } : undefined}
                                />
                                <div className="absolute inset-2 pointer-events-none rounded-xl border border-white/5 mix-blend-overlay"></div>
                            </div>
                        </div>
                    </section>

                    {/* Floating Zoom Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-lg shadow-xl">
                        <button 
                            onClick={() => setZoom((z: number) => Math.max(0.25, z - 0.25))}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition cursor-pointer"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setZoom(1)}
                            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition select-none min-w-[3.5rem] text-center cursor-pointer"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button 
                            onClick={() => setZoom((z: number) => Math.min(5, z + 0.25))}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition cursor-pointer"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}