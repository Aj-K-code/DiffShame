
import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useSettings } from '../../contexts/SettingsContext';
import { GitHubService } from '../../services/github';
import { Ghost, Plus, Check } from 'lucide-react';
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

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    useEffect(() => {
        // Fetch previous image for the selected sector to use as ghost
        const fetchPreviousImage = async () => {
            if (!githubToken || !githubUsername || !githubRepo) return;

            const gh = new GitHubService(githubToken, githubUsername, githubRepo);

            // Logic to find the "previous" month's image
            // For simplicity, let's try to find the most recent image for this sector
            // In a real app, we might list folders and find the latest one

            // For now, let's just try to fetch a hypothetical "previous" image
            // Or maybe we just list all files in `data / ` and find the latest matching the sector

            // Simplified: Check last month.
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

        setIsUploading(true);
        setUploadStatus('idle');

        try {
            const gh = new GitHubService(githubToken, githubUsername, githubRepo);

            // Convert base64 to File object
            const res = await fetch(imageData);
            const blob = await res.blob();
            const file = new File([blob], `${selectedSector}.jpg`, { type: 'image/jpeg' });

            const date = new Date();
            const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const path = `data/${currentMonth}/${selectedSector}.jpg`;

            await gh.uploadImage(path, file, `Update ${selectedSector} for ${currentMonth}`);
            setUploadStatus('success');
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
                    {isUploading ? (
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : uploadStatus === 'success' ? (
                        <Check size={32} className="text-green-500" />
                    ) : (
                        <div className="w-16 h-16 bg-white rounded-full" />
                    )}
                </button>
            </div>
        </div>
    );
};
