
import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useSettings } from '../../contexts/SettingsContext';
import { GitHubService } from '../../services/github';
import { Ghost, Plus, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

export const CameraView: React.FC = () => {
    const { videoRef, startCamera, stopCamera, captureImage, error } = useCamera();
    const { githubToken, githubUsername, githubRepo } = useSettings();

    const [sectors] = useState<string[]>(['Desk', 'Bed', 'Closet', 'North Wall']);
    const [selectedSector, setSelectedSector] = useState<string>(sectors[0]);
    const [ghostImage, setGhostImage] = useState<string | null>(null);
    const [opacity, setOpacity] = useState<number>(0.5);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Photo preview state
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Start camera once on mount
    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount/unmount

    // Fetch ghost image when sector changes
    useEffect(() => {
        const fetchPreviousImage = async () => {
            if (!githubToken || !githubUsername || !githubRepo) return;

            const gh = new GitHubService(githubToken, githubUsername, githubRepo);

            // Try to fetch previous month's image for this sector
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const lastMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const path = `data/${lastMonth}/${selectedSector}.jpg`;

            try {
                const content = await gh.getFileContent(path);
                setGhostImage(`data:image/jpeg;base64,${content}`);
            } catch (e) {
                console.log("No previous image found for ghost overlay");
                setGhostImage(null);
            }
        };

        fetchPreviousImage();
    }, [selectedSector, githubToken, githubUsername, githubRepo]);

    const handleCapture = async () => {
        const imageData = await captureImage();
        if (!imageData) return;

        setCapturedPhoto(imageData);
        setShowPreview(true);
    };

    const handleRetake = () => {
        setCapturedPhoto(null);
        setShowPreview(false);
    };

    const handleConfirm = async () => {
        if (!capturedPhoto) return;

        setIsUploading(true);
        setUploadStatus('idle');

        try {
            const gh = new GitHubService(githubToken, githubUsername, githubRepo);

            // Convert base64 to File object
            const res = await fetch(capturedPhoto);
            const blob = await res.blob();
            const file = new File([blob], `${selectedSector}.jpg`, { type: 'image/jpeg' });

            const date = new Date();
            const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const path = `data/${currentMonth}/${selectedSector}.jpg`;

            await gh.uploadImage(path, file, `Update ${selectedSector} for ${currentMonth}`);
            setUploadStatus('success');
            setShowPreview(false);
            setCapturedPhoto(null);

            // Update ghost image with the newly captured photo
            setGhostImage(capturedPhoto);

            setTimeout(() => setUploadStatus('idle'), 3000);
        } catch (e) {
            console.error("Upload failed", e);
            setUploadStatus('error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 max-w-md mx-auto">
            <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Select Sector</label>
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setSelectedSector(sector)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                                selectedSector === sector
                                    ? "bg-primary text-white"
                                    : "bg-surface text-gray-300 border border-gray-700"
                            )}
                        >
                            {sector}
                        </button>
                    ))}
                    <button className="px-3 py-2 rounded-full bg-surface border border-gray-700 text-gray-300">
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
                {error ? (
                    <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {ghostImage && (
                            <img
                                src={ghostImage}
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                style={{ opacity }}
                                alt="Ghost overlay"
                            />
                        )}

                        {ghostImage && (
                            <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-lg backdrop-blur-sm">
                                <Ghost size={20} className="text-white mb-2 mx-auto" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={opacity}
                                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                    className="h-24 w-2 appearance-none bg-gray-600 rounded-full outline-none vertical-slider"
                                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleCapture}
                    disabled={isUploading || !!error}
                    className={clsx(
                        "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all transform active:scale-95",
                        isUploading ? "border-gray-500 bg-gray-800" : "border-white bg-white/10 hover:bg-white/20",
                        uploadStatus === 'success' && "border-green-500 bg-green-500/20",
                        uploadStatus === 'error' && "border-red-500 bg-red-500/20"
                    )}
                >
                    {uploadStatus === 'success' ? (
                        <Check size={32} className="text-green-500" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-full" />
                    )}
                </button>
            </div>

            {/* Photo Preview Modal */}
            {showPreview && capturedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-surface rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
                        <div className="p-4 border-b border-gray-800">
                            <h2 className="text-xl font-semibold text-white">Preview Photo</h2>
                            <p className="text-sm text-muted mt-1">Does this look good?</p>
                        </div>

                        <div className="relative aspect-video bg-black">
                            <img
                                src={capturedPhoto}
                                alt="Captured preview"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="p-4 flex gap-3">
                            <button
                                onClick={handleRetake}
                                disabled={isUploading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                                Retake
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isUploading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Looks Good
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
