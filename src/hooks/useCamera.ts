import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraReturn {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    stream: MediaStream | null;
    error: string | null;
    captureImage: () => Promise<string | null>;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
}

export const useCamera = (): UseCameraReturn => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Prefer back camera on mobile
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you have granted permissions.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const captureImage = useCallback(async (): Promise<string | null> => {
        if (!videoRef.current || !stream) return null;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8); // Return base64 JPEG
    }, [stream]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        videoRef,
        stream,
        error,
        captureImage,
        startCamera,
        stopCamera,
    };
};
