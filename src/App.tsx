import { useEffect, useState } from 'react';
import { UploadZone } from '@/features/upload/components/UploadZone';
import type { UploadedImage } from '@/features/upload/types/upload.types';

function App() {
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

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold">
            MaskMyID
          </h1>

          <p className="mt-4 text-zinc-400">
            Privacy-first document masking tool.
            Your files never leave your device.
          </p>
        </header>

        <UploadZone
          image={image}
          onImageUpload={setImage}
          onRemoveImage={handleRemoveImage}
        />
      </div>
    </main>
  );
}

export default App;