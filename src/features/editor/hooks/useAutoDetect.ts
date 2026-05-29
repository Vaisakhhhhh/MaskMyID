import { useEffect, useRef } from 'react';
import type { MaskRect } from '../types/mask.types';
import { autoDetectMasks } from '../utils/ocrDetector';

export function useAutoDetect(
    imageUrl: string,
    setHistory: React.Dispatch<React.SetStateAction<MaskRect[][]>>,
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
) {
    const autoDetectAttemptedRef = useRef<string | null>(null);

    useEffect(() => {
        if (autoDetectAttemptedRef.current === imageUrl) return;
        autoDetectAttemptedRef.current = imageUrl;
        
        let isMounted = true;
        
        const detect = async () => {
            try {
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
    }, [imageUrl, setHistory, setHistoryIndex]);
}
