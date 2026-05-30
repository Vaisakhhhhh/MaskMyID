import { Square, Circle, Grid, EyeOff, Undo2, Redo2, Trash, RefreshCw } from 'lucide-react';
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
}: EditorToolbarProps) {
    return (
        <aside className="w-full lg:w-80 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 p-5 flex flex-col gap-6 overflow-y-auto z-10 shrink-0">
            <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">1. Mask Shape</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setSelectedMaskShape('rectangle')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer font-medium text-sm transition ${selectedMaskShape === 'rectangle'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                    >
                        <Square className="w-5 h-5 mb-1.5" />
                        Rectangle
                    </button>
                    <button
                        onClick={() => setSelectedMaskShape('circle')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer font-medium text-sm transition ${selectedMaskShape === 'circle'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                    >
                        <Circle className="w-5 h-5 mb-1.5" />
                        Circle
                    </button>
                </div>
            </div>

            <hr className="border-zinc-800" />

            <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">2. Mask Style</label>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setSelectedMaskType('black')}
                        className={`cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border font-medium text-sm transition text-left ${selectedMaskType === 'black'
                            ? 'border-zinc-700 bg-zinc-800 text-white'
                            : 'border-transparent hover:border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                    >
                        <span className="w-4 h-4 rounded bg-black border border-zinc-600"></span>
                        Solid Black
                    </button>
                    <button
                        onClick={() => setSelectedMaskType('pixelate')}
                        className={`cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border font-medium text-sm transition text-left ${selectedMaskType === 'pixelate'
                            ? 'border-zinc-700 bg-zinc-800 text-white'
                            : 'border-transparent hover:border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                    >
                        <Grid className={`w-4 h-4 ${selectedMaskType === 'pixelate' ? 'text-white' : 'text-zinc-400'}`} />
                        Pixelate
                    </button>
                    <button
                        onClick={() => setSelectedMaskType('blur')}
                        className={`cursor-pointer flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border font-medium text-sm transition text-left ${selectedMaskType === 'blur'
                            ? 'border-zinc-700 bg-zinc-800 text-white'
                            : 'border-transparent hover:border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                    >
                        <EyeOff className={`w-4 h-4 ${selectedMaskType === 'blur' ? 'text-white' : 'text-zinc-400'}`} />
                        Blur
                    </button>
                </div>
            </div>

            <hr className="border-zinc-800" />

            <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">Actions</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition disabled:opacity-40 cursor-pointer"
                    >
                        <Undo2 className="w-3.5 h-3.5" /> Undo
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition disabled:opacity-40 cursor-pointer"
                    >
                        <Redo2 className="w-3.5 h-3.5" /> Redo
                    </button>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={!hasSelection}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800/40 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 text-xs font-medium text-zinc-400 hover:text-red-400 transition mb-2 disabled:opacity-40 disabled:hover:border-transparent disabled:hover:bg-zinc-800/40 disabled:hover:text-zinc-400 cursor-pointer"
                >
                    <Trash className="w-3.5 h-3.5" /> Delete Selected Layer
                </button>
                <button
                    onClick={handleClearAll}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800/20 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Clear Canvas
                </button>
            </div>
        </aside>
    );
}
