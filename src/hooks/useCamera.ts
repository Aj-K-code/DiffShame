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
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Prefer back camera on mobile
                audio: false,
            });
            streamRef.current = mediaStream;
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
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setStream(null);
        }
    }, []);

    const captureImage = useCallback(async (): Promise<string | null> => {
        if (!videoRef.current || !streamRef.current) return null;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8); // Return base64 JPEG
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    return {
        videoRef,
        stream,
        error,
        captureImage,
        startCamera,
        stopCamera,
    };
};
