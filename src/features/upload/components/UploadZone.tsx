import { useCallback } from 'react';
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

            <div className="space-y-4 text-center">
                <div className="text-5xl">📄</div>

                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Upload your document
                    </h2>

                    <p className="mt-2 text-zinc-400">
                        Drag & drop your Aadhaar or PAN card image here
                    </p>
                </div>

                <div className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black">
                    Choose Image
                </div>

                <p className="text-xs text-zinc-500">
                    PNG, JPG, JPEG, WEBP
                </p>
            </div>
        </div>
    );
}