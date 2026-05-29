import { useEffect, useRef } from 'react';

interface ImageCanvasProps {
  imageUrl: string;
}

export function ImageCanvas({
  imageUrl,
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    };

    image.src = imageUrl;
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full rounded-2xl border border-zinc-800"
    />
  );
}