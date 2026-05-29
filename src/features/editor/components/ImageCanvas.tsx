import { useEffect, useRef, useState } from 'react';
import type { MaskRect, MaskType } from '../types/mask.types';
import { pixelateRegion } from '../utils/pixelate';

interface ImageCanvasProps {
    imageUrl: string;
}

export function ImageCanvas({
    imageUrl,
}: ImageCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [masks, setMasks] = useState<MaskRect[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedMaskType, setSelectedMaskType] = useState<MaskType>('black');

    const startPointRef = useRef({
        x: 0,
        y: 0,
    });

    const getCanvasCoordinates = (
        event: React.MouseEvent<HTMLCanvasElement>,
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return { x: 0, y: 0 };
        }

        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    };

    const handleMouseDown = (
        event: React.MouseEvent<HTMLCanvasElement>,
    ) => {
        const point = getCanvasCoordinates(event);

        startPointRef.current = point;

        setIsDrawing(true);
    };

    const handleMouseUp = (
        event: React.MouseEvent<HTMLCanvasElement>,
    ) => {
        if (!isDrawing) return;

        const endPoint = getCanvasCoordinates(event);

        const start = startPointRef.current;

        const newMask: MaskRect = {
            id: crypto.randomUUID(),
            x: Math.min(start.x, endPoint.x),
            y: Math.min(start.y, endPoint.y),
            width: Math.abs(endPoint.x - start.x),
            height: Math.abs(endPoint.y - start.y),
            type: selectedMaskType,
        };

        setMasks((prev) => [...prev, newMask]);

        setIsDrawing(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const image = new Image();

        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(
                image,
                0,
                0,
                image.width,
                image.height,
            );

            masks.forEach((mask) => {
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;

                switch (mask.type) {
                    case 'black':
                        ctx.fillStyle = '#000';
                        ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
                        break;

                    case 'pixelate':
                        pixelateRegion(
                            ctx,
                            mask.x,
                            mask.y,
                            mask.width,
                            mask.height,
                        );
                        break;

                    case 'blur':
                        // implement later
                        break;
                }

                ctx.strokeRect(
                    mask.x,
                    mask.y,
                    mask.width,
                    mask.height,
                );
            });
        };

        image.src = imageUrl;
    }, [imageUrl, masks]);

    const handleExport = () => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const link = document.createElement('a');

        link.download = 'masked-document.png';

        link.href = canvas.toDataURL('image/png');

        link.click();
    };

    return (
        <>
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setSelectedMaskType('black')}
                >
                    Black
                </button>

                <button
                    onClick={() => setSelectedMaskType('pixelate')}
                >
                    Pixelate
                </button>

                <button
                    onClick={() => setSelectedMaskType('blur')}
                >
                    Blur
                </button>
                <button
                    onClick={() => setMasks([])}
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
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                className="max-w-full rounded-2xl border border-zinc-800 cursor-crosshair"
            />
        </>
    );
}