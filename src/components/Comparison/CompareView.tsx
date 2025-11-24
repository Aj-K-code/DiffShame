import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, Sparkles, AlertTriangle, Trash2, Key } from 'lucide-react';
import { clsx } from 'clsx';
import { GeminiService, type AnalysisResult } from '../../services/gemini';

const SECTIONS = ['Door', 'Desktop', 'Bed', 'Couch', 'Workdesk'];

// Available months - you can extend this list as you add more photos
const AVAILABLE_MONTHS = ['2025-01', '2024-12', '2024-11'];

export const CompareView: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
    const [date1, setDate1] = useState<string>(AVAILABLE_MONTHS[1] || AVAILABLE_MONTHS[0]);
    const [date2, setDate2] = useState<string>(AVAILABLE_MONTHS[0]);

    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [image1Error, setImage1Error] = useState(false);
    const [image2Error, setImage2Error] = useState(false);

    const [sliderPosition, setSliderPosition] = useState(50);

    // AI Analysis state
    const [geminiApiKey, setGeminiApiKey] = useState<string>('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    // Load API key from localStorage on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setGeminiApiKey(savedKey);
        }
    }, []);

    useEffect(() => {
        // Load images from public/photos folder
        const loadImages = () => {
            if (!date1 || !date2) return;

            // Reset error states
            setImage1Error(false);
            setImage2Error(false);

            // Construct paths to images
            const path1 = `/DiffShame/photos/${date1}/${selectedSection}.jpg`;
            const path2 = `/DiffShame/photos/${date2}/${selectedSection}.jpg`;

            // Test if images exist by attempting to load them
            const img1 = new Image();
            img1.onload = () => setImage1(path1);
            img1.onerror = () => {
                setImage1(null);
                setImage1Error(true);
            };
            img1.src = path1;

            const img2 = new Image();
            img2.onload = () => setImage2(path2);
            img2.onerror = () => {
                setImage2(null);
                setImage2Error(true);
            };
            img2.src = path2;
        };

        loadImages();
    }, [selectedSection, date1, date2]);

    return (
        <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full">
            <div className="mb-6 space-y-4">
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {SECTIONS.map(section => (
                        <button
                            key={section}
                            onClick={() => setSelectedSection(section)}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                                selectedSection === section
                                    ? "bg-primary text-white"
                                    : "bg-surface text-gray-300 border border-gray-700"
                            )}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-4 bg-surface p-3 rounded-lg border border-gray-800">
                    <select
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                        className="bg-transparent text-white outline-none text-sm cursor-pointer flex-1"
                    >
                        {AVAILABLE_MONTHS.map(month => (
                            <option key={month} value={month}>
                                {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <ArrowRight size={16} className="text-muted flex-shrink-0" />
                    <select
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                        className="bg-transparent text-white outline-none text-sm text-right cursor-pointer flex-1"
                    >
                        {AVAILABLE_MONTHS.map(month => (
                            <option key={month} value={month}>
                                {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800 mb-6 group select-none">
                {!image1 || !image2 || image1Error || image2Error ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted p-8 text-center">
                        <AlertCircle size={48} className="mb-4 text-yellow-500" />
                        <p className="text-lg mb-2">Photos not found</p>
                        {image1Error && (
                            <p className="text-sm mb-1">Missing: <code className="text-primary">{date1}/{selectedSection}.jpg</code></p>
                        )}
                        {image2Error && (
                            <p className="text-sm mb-3">Missing: <code className="text-primary">{date2}/{selectedSection}.jpg</code></p>
                        )}
                        <p className="text-sm text-gray-400">Add photos to <code>public/photos/YYYY-MM/SectionName.jpg</code></p>
                    </div>
                ) : (
                    <>
                        {/* Image 2 (After) - Background */}
                        <img
                            src={image2}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="After"
                        />

                        {/* Image 1 (Before) - Clipped */}
                        <div
                            className="absolute inset-0 w-full h-full overflow-hidden"
                            style={{ width: `${sliderPosition}%` }}
                        >
                            <img
                                src={image1}
                                className="absolute inset-0 w-full h-full object-cover max-w-none"
                                style={{ width: '100vw', maxWidth: '42rem' }}
                                alt="Before"
                            />
                        </div>

                        {/* Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8L22 12L18 16" />
                                    <path d="M6 8L2 12L6 16" />
                                </svg>
                            </div>
                        </div>

                        {/* Interaction Layer */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPosition}
                            onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                        />

                        <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white pointer-events-none">
                            {date1}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-xs text-white pointer-events-none">
                            {date2}
                        </div>
                    </>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-surface/50 rounded-lg border border-gray-800 p-4">
                <p className="text-sm text-muted text-center">
                    Drag the slider to compare photos from different months
                </p>
            </div>
        </div>
    );
};
