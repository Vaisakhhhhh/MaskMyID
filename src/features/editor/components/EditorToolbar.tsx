import type { MaskType, MaskShape } from '../types/mask.types';

interface EditorToolbarProps {
    selectedMaskType: MaskType;
    setSelectedMaskType: (type: MaskType) => void;
    selectedMaskShape: MaskShape;
    setSelectedMaskShape: (shape: MaskShape) => void;
    canUndo: boolean;
    canRedo: boolean;
    handleUndo: () => void;
    handleRedo: () => void;
    hasSelection: boolean;
    handleDelete: () => void;
    handleClearAll: () => void;
    handleExport: () => void;
    onRemoveImage: () => void;
}

export function EditorToolbar({
    selectedMaskType,
    setSelectedMaskType,
    selectedMaskShape,
    setSelectedMaskShape,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    hasSelection,
    handleDelete,
    handleClearAll,
    handleExport,
    onRemoveImage
}: EditorToolbarProps) {
    return (
        <div className="mb-4 flex flex-wrap gap-2">
            <button
                onClick={() => setSelectedMaskShape('rectangle')}
                className={`rounded-lg px-4 py-2 ${selectedMaskShape === 'rectangle' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
            >
                Rectangle
            </button>
            <button
                onClick={() => setSelectedMaskShape('circle')}
                className={`rounded-lg px-4 py-2 ${selectedMaskShape === 'circle' ? 'bg-zinc-700' : 'bg-zinc-800'}`}
            >
                Circle
            </button>
            
            <div className="mx-2 w-px bg-zinc-800"></div>

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
                disabled={!canUndo}
                className={`rounded-lg px-4 py-2 ${!canUndo ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800'}`}
            >
                Undo
            </button>
            <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`rounded-lg px-4 py-2 ${!canRedo ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800'}`}
            >
                Redo
            </button>
            <div className="mx-2 w-px bg-zinc-800"></div>
            <button
                onClick={handleDelete}
                disabled={!hasSelection}
                className={`rounded-lg px-4 py-2 ${!hasSelection ? 'bg-zinc-800/50 text-zinc-500' : 'bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white'}`}
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
    );
}
