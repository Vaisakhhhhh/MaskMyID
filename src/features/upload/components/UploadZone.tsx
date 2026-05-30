import { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { UploadedImage } from '../types/upload.types';

interface UploadZoneProps {
    onImageUpload: (image: UploadedImage) => void;
}

export function UploadZone({
    onImageUpload,
}: UploadZoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            const MAX_FILE_SIZE = 5 * 1024 * 1024;

            if (!file) return;

            if (file.size > MAX_FILE_SIZE) {
                alert('File size must be less than 5MB');
                return;
            }

            const preview = URL.createObjectURL(file);

            onImageUpload({
                file,
                preview,
            });
        },
        [onImageUpload],
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive,
    } = useDropzone({
        onDrop,
        accept: {
            'image/png': [],
            'image/jpeg': [],
            'image/jpg': [],
            'image/webp': [],
        },
        multiple: false,
    });


    return (
        <div
            {...getRootProps()}
            className={`
        mx-auto flex min-h-87.5 w-full max-w-2xl
        cursor-pointer flex-col items-center justify-center
        rounded-2xl border-2 border-dashed
        transition-all duration-200
        ${isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                }
      `}
        >
            <input {...getInputProps()} />

            <div className="space-y-4 flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-blue-400 mb-2 border border-zinc-700/50 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                        Upload your document
                    </h2>

                    <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                        Drag & drop your ID card, passport, or document image here
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20">
                    <ImageIcon className="w-4 h-4" /> Choose Image
                </div>

                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    PNG, JPG, JPEG, WEBP up to 5MB
                </p>
            </div>
        </div>
    );
}