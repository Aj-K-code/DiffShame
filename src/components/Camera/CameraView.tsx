import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { GeminiService, type AnalysisResult } from '../../services/gemini';
import { Camera, X, Sparkles, Target, Flame, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

const SECTIONS = ['Door', 'Desktop', 'Bed', 'Couch', 'Workdesk'];
const AVAILABLE_MONTHS = ['2024-10', '2024-11'];

export const CameraView: React.FC = () => {
    const { videoRef, startCamera, stopCamera, captureImage, error } = useCamera();

    // Step 1: Selection
    const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
    const [selectedComparisonMonth, setSelectedComparisonMonth] = useState<string>(AVAILABLE_MONTHS[0]); // 2024-10

    // Step 2: Photo capture
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [comparisonPhoto, setComparisonPhoto] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);

    // Step 3: Comparison slider
    const [sliderPosition, setSliderPosition] = useState(50);

    // Step 4: AI Analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analysisStatus, setAnalysisStatus] = useState<string>(''); // New state for status updates

    // Load comparison photo when selection changes
    useEffect(() => {
        if (!selectedSection || !selectedComparisonMonth) return;

        const path = `/DiffShame/photos/${selectedComparisonMonth}/${selectedSection}.jpg`;
        const img = new Image();
        img.onload = () => setComparisonPhoto(path);
        img.onerror = () => {
            console.error(`Failed to load comparison photo: ${path}`);
            setComparisonPhoto(null);
        };
        img.src = path;
    }, [selectedSection, selectedComparisonMonth]);

    // Start camera when entering camera mode
    useEffect(() => {
        if (showCamera) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCamera]);

    const handleStartCamera = () => {
        if (!comparisonPhoto) {
            alert(`No photo found for ${selectedSection} in ${selectedComparisonMonth}. Please add one first.`);
            return;
        }
        setShowCamera(true);
        setCapturedPhoto(null);
        setAnalysisResult(null);
        setAnalysisStatus('');
    };

    const handleCapture = async () => {
        const imageData = await captureImage();
        if (!imageData) return;

        setCapturedPhoto(imageData);
        setShowCamera(false);
        stopCamera();
    };

    const handleRetake = () => {
        setCapturedPhoto(null);
        setAnalysisResult(null);
        setShowCamera(true);
        startCamera();
    };

    const handleAnalyze = async () => {
        if (!capturedPhoto || !comparisonPhoto) return;

        // Check for API key
        let apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');

        if (!apiKey) {
            const userKey = prompt('Enter your Gemini API key (get one at https://makersuite.google.com/app/apikey):');
            if (!userKey) return;
            apiKey = userKey;
            localStorage.setItem('gemini_api_key', apiKey);
        }

        setIsAnalyzing(true);
        setAnalysisStatus('Preparing images...');

        try {
            // 1. Prepare Current Image
            const currentBase64 = capturedPhoto.split(',')[1];

            // 2. Prepare Comparison Image
            setAnalysisStatus('Loading comparison photo...');
            const response = await fetch(comparisonPhoto);
            if (!response.ok) throw new Error(`Failed to fetch comparison photo: ${response.statusText}`);
            const blob = await response.blob();

            const reader = new FileReader();
            reader.onerror = () => {
                throw new Error('Failed to read comparison photo');
            };

            reader.onloadend = async () => {
                try {
                    const previousBase64 = (reader.result as string).split(',')[1];

                    // 3. Call Gemini
                    setAnalysisStatus('Sending to Gemini (this may take 10-15s)...');
                    const gemini = new GeminiService(apiKey!); // apiKey is checked above

                    // Add timeout race
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Analysis timed out after 30s')), 30000)
                    );

                    const result = await Promise.race([
                        gemini.analyzeImages(currentBase64, previousBase64),
                        timeoutPromise
                    ]) as AnalysisResult;

                    setAnalysisResult(result);
                    setIsAnalyzing(false);
                    setAnalysisStatus('');
                } catch (e: any) {
                    console.error("Gemini Error:", e);
                    alert(`Analysis failed: ${e.message || 'Unknown error'}`);
                    setIsAnalyzing(false);
                    setAnalysisStatus('Failed');
                }
            };

            reader.readAsDataURL(blob);
        } catch (e: any) {
            console.error("Preparation Error:", e);
            alert(`Error preparing analysis: ${e.message}`);
            setIsAnalyzing(false);
            setAnalysisStatus('Failed');
        }
    };

    return (
        <div className="min-h-screen p-4 max-w-4xl mx-auto">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">📸 DiffShame</h1>
                <p className="text-muted">Compare your before/after and get roasted by AI</p>
            </div>

            {/* Step 1: Selection (always visible) */}
            {!showCamera && !capturedPhoto && (
                <div className="space-y-6">
                    <div className="bg-surface rounded-xl border border-gray-800 p-6">
                        <label className="block text-sm font-medium text-muted mb-3">1. Select Section</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SECTIONS.map(section => (
                                <button
                                    key={section}
                                    onClick={() => setSelectedSection(section)}
                                    className={clsx(
                                        "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                        selectedSection === section
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-black/30 text-gray-300 border border-gray-700 hover:border-primary/50"
                                    )}
                                >
                                    {section}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-gray-800 p-6">
                        <label className="block text-sm font-medium text-muted mb-3">2. Compare Against</label>
                        <select
                            value={selectedComparisonMonth}
                            onChange={(e) => setSelectedComparisonMonth(e.target.value)}
                            className="w-full bg-black/30 text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-primary"
                        >
                            {AVAILABLE_MONTHS.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </option>
                            ))}
                        </select>
                        {comparisonPhoto && (
                            <div className="mt-4">
                                <p className="text-xs text-muted mb-2">Preview:</p>
                                <img src={comparisonPhoto} alt="Comparison" className="w-full rounded-lg border border-gray-700" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStartCamera}
                        disabled={!comparisonPhoto}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        <Camera size={24} />
                        3. Take Photo Now
                    </button>
                </div>
            )}

            {/* Step 2: Camera View */}
            {showCamera && !capturedPhoto && (
                <div className="space-y-4">
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
                        {error ? (
                            <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
                                {error}
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setShowCamera(false); stopCamera(); }}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            <X size={20} />
                            Cancel
                        </button>
                        <button
                            onClick={handleCapture}
                            disabled={!!error}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
                        >
                            <Camera size={20} />
                            Capture
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 & 4: Comparison Slider + AI Analysis */}
            {capturedPhoto && comparisonPhoto && !showCamera && (
                <div className="space-y-6">
                    {/* Comparison Slider */}
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800 select-none group">
                        {/* New photo (background - "After") */}
                        <img
                            src={capturedPhoto}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Current (After)"
                        />

                        {/* Old photo (foreground - "Before") - using clip-path for correct resizing */}
                        <img
                            src={comparisonPhoto}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                            }}
                            alt="Previous (Before)"
                        />

                        {/* Slider handle */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                                <span className="text-xs font-bold">⟷</span>
                            </div>
                        </div>

                        {/* Interaction Layer */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPosition}
                            onChange={(e) => setSliderPosition(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                        />

                        {/* Labels */}
                        <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs text-white pointer-events-none z-0">
                            {selectedComparisonMonth} (Before)
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded text-xs text-white pointer-events-none z-0">
                            Now (After)
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!analysisResult && (
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    <X size={20} />
                                    Retake
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Flame size={20} />
                                            Get Roasted by AI
                                        </>
                                    )}
                                </button>
                            </div>
                            {isAnalyzing && (
                                <p className="text-center text-sm text-muted animate-pulse">
                                    {analysisStatus}
                                </p>
                            )}
                        </div>
                    )}

                    {/* AI Roast Results */}
                    {analysisResult && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Flame className="text-orange-500" size={24} />
                                    AI Roast Results
                                </h3>
                                <button
                                    onClick={() => { setCapturedPhoto(null); setAnalysisResult(null); }}
                                    className="text-sm text-muted hover:text-white"
                                >
                                    Start Over
                                </button>
                            </div>

                            {/* Stagnant Items */}
                            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 p-6">
                                <h4 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
                                    <Target size={20} />
                                    Items Collecting Dust (Haven't Moved in a Month!)
                                </h4>
                                {analysisResult.stagnantItems.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysisResult.stagnantItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-300">
                                                <span className="text-yellow-500 font-bold">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">Impressive! Nothing's been sitting around unused. Keep it up! 🎉</p>
                                )}
                            </div>

                            {/* Trash Items */}
                            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/30 p-6">
                                <h4 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
                                    <Sparkles size={20} />
                                    Time to Trash These
                                </h4>
                                {analysisResult.trashItems.length > 0 ? (
                                    <ul className="space-y-2">
                                        {analysisResult.trashItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-gray-300">
                                                <span className="text-red-500 font-bold">•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">Clean! No obvious trash detected. You're doing great! ✨</p>
                                )}
                            </div>

                            {/* Next Month Goals */}
                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/30 p-6">
                                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Goals for Next Month
                                </h4>
                                <ul className="space-y-3">
                                    {analysisResult.stagnantItems.length > 0 && (
                                        <li className="flex items-start gap-3">
                                            <span className="text-primary text-xl">→</span>
                                            <span className="text-gray-300">
                                                Deal with <strong className="text-white">{analysisResult.stagnantItems.length}</strong> stagnant item{analysisResult.stagnantItems.length > 1 ? 's' : ''} that are just sitting there
                                            </span>
                                        </li>
                                    )}
                                    {analysisResult.trashItems.length > 0 && (
                                        <li className="flex items-start gap-3">
                                            <span className="text-primary text-xl">→</span>
                                            <span className="text-gray-300">
                                                Remove or organize <strong className="text-white">{analysisResult.trashItems.length}</strong> clutter item{analysisResult.trashItems.length > 1 ? 's' : ''}
                                            </span>
                                        </li>
                                    )}
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary text-xl">→</span>
                                        <span className="text-gray-300">Set up a weekly 5-minute cleanup routine</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-primary text-xl">→</span>
                                        <span className="text-gray-300">Take next month's photo to track your progress!</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
