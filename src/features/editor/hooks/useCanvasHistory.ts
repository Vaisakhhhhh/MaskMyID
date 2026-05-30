import { useState, useCallback } from 'react';
import type { MaskRect } from '../types/mask.types';

export function useCanvasHistory(initialMasks: MaskRect[][] = [[]]) {
    const [history, setHistory] = useState<MaskRect[][]>(initialMasks);
    const [historyIndex, setHistoryIndex] = useState(0);

    const masks = history[historyIndex];
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const pushHistory = useCallback((newMasks: MaskRect[]) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(newMasks);
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const handleUndo = useCallback(() => {
        setHistoryIndex(prev => Math.max(0, prev - 1));
    }, []);

    const handleRedo = useCallback(() => {
        setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
    }, [history.length]);

    const handleDelete = useCallback((selectedMaskId: string | null) => {
        if (!selectedMaskId) return;
        const newMasks = masks.filter(m => m.id !== selectedMaskId);
        pushHistory(newMasks);
    }, [masks, pushHistory]);

    const handleClearAll = useCallback(() => {
        pushHistory([]);
    }, [pushHistory]);

    return {
        masks,
        history,
        historyIndex,
        setHistory,
        setHistoryIndex,
        pushHistory,
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,
        handleDelete,
        handleClearAll,
    };
}
