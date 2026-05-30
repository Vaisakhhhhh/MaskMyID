import { useEffect, useState } from 'react';
import { UploadZone } from '@/features/upload/components/UploadZone';
import type { UploadedImage } from '@/features/upload/types/upload.types';
import { ImageCanvas } from '@/features/editor/components/ImageCanvas';
import { LandingPage } from '@/pages/LandingPage';
import { ShieldCheck } from 'lucide-react';

function App() {
  const [page, setPage] = useState<'landing' | 'editor'>('landing');
  const [image, setImage] = useState<UploadedImage | null>(null);

  useEffect(() => {
    return () => {
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image]);

  const handleRemoveImage = () => {
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
  };

  if (page === 'landing') {
    return <LandingPage onLaunchApp={() => setPage('editor')} />;
  }

  if (!image) {
    return (
      <div className="flex flex-col h-full w-full">
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={() => setPage('landing')}>
              <ShieldCheck className="w-5 h-5 text-blue-500" /> MaskMyID <span className="text-xs font-normal bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">v1.0</span>
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block">Privacy-first document masking. Your files never leave your device.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage('landing')}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700">
              Back to Home
            </button>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-6 bg-zinc-950 overflow-auto">
          <UploadZone onImageUpload={setImage} />
        </main>
      </div>
    );
  }

  return (
    <ImageCanvas
      imageUrl={image.preview}
      onRemoveImage={handleRemoveImage}
      onGoHome={() => setPage('landing')}
    />
  );
}

export default App;