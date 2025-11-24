import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { GeminiService, type AnalysisResult } from '../../services/gemini';
import { Camera, Check, X, Sparkles, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { clsx } from 'clsx';

const SECTIONS = ['Door', 'Desktop', 'Bed', 'Couch', 'Workdesk'];

export const CameraView: React.FC = () => {
    const { videoRef, startCamera, stopCamera, captureImage, error } = useCamera();

    const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0]);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previousPhoto, setPreviousPhoto] = useState<string | null>(null);

    // Gemini API state
    const [geminiApiKey, setGeminiApiKey] = useState<string>('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    // Load API key from localStorage
    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setGeminiApiKey(savedKey);
        }
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load previous month's photo when section changes
    useEffect(() => {
        const loadPreviousPhoto = async () => {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const lastMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const path = `/DiffShame/photos/${lastMonth}/${selectedSection}.jpg`;

            const img = new Image();
            img.onload = () => setPreviousPhoto(path);
            img.onerror = () => setPreviousPhoto(null);
            img.src = path;
        };

        loadPreviousPhoto();
    }, [selectedSection]);

    const handleCapture = async () => {
        const imageData = await captureImage();
        if (!imageData) return;

        setCapturedPhoto(imageData);
        setShowPreview(true);
        setAnalysisResult(null);
    };

    const handleRetake = () => {
        setCapturedPhoto(null);
        setShowPreview(false);
        setAnalysisResult(null);
    };

    const handleAnalyze = async () => {
        if (!capturedPhoto || !previousPhoto || !geminiApiKey) {
            if (!geminiApiKey) {
                setShowApiKeyInput(true);
            }
            return;
        }

        setIsAnalyzing(true);

        try {
            // Convert current photo to base64
            const currentBase64 = capturedPhoto.split(',')[1];

            // Load and convert previous photo to base64
            const response = await fetch(previousPhoto);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const previousBase64 = (reader.result as string).split(',')[1];

                const gemini = new GeminiService(geminiApiKey);
                const result = await gemini.analyzeImages(currentBase64, previousBase64);
                setAnalysisResult(result);
                setIsAnalyzing(false);
            };

            reader.readAsDataURL(blob);
        } catch (e) {
            console.error("Analysis failed", e);
            alert("Analysis failed. Check your API key and try again.");
            setIsAnalyzing(false);
        }
    };

    const saveApiKey = () => {
        localStorage.setItem('gemini_api_key', geminiApiKey);
        setShowApiKeyInput(false);
    };

    return (
        <div className="flex flex-col h-full p-4 max-w-md mx-auto">
            {/* Section Selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Select Section</label>
                <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {SECTIONS.map(section => (
                        <button
                            key={section}
                            onClick={() => setSelectedSection(section)}
                            disabled={showPreview}
                            className={clsx(
                                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors",
                                selectedSection === section
                                    ? "bg-primary text-white"
                                    : "bg-surface text-gray-300 border border-gray-700",
                                showPreview && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {section}
                        </button>
                    ))}
                </div>
            </div>

            {/* Camera View */}
            {!showPreview && (
                <>
                    <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
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
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <button
                            onClick={handleCapture}
                            disabled={!!error}
                            className="w-20 h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all transform active:scale-95 disabled:opacity-50"
                        >
                            <div className="w-16 h-16 bg-white rounded-full" />
                        </button>
                        <p className="text-sm text-muted">Take a photo of your {selectedSection.toLowerCase()}</p>
                    </div>
                </>
            )}

            {/* Photo Preview & Analysis */}
            {showPreview && capturedPhoto && (
                <div className="flex-1 flex flex-col">
                    <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800 mb-4">
                        <img
                            src={capturedPhoto}
                            alt="Captured preview"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {!analysisResult && (
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={handleRetake}
                                disabled={isAnalyzing}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <X size={20} />
                                Retake
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !previousPhoto}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Analyze
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {!previousPhoto && !isAnalyzing && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-500">
                                No previous photo found for comparison. Add a photo in <code>public/photos/2024-12/{selectedSection}.jpg</code>
                            </p>
                        </div>
                    )}

                    {/* API Key Input */}
                    {showApiKeyInput && (
                        <div className="bg-surface rounded-lg border border-gray-800 p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Camera size={20} className="text-primary" />
                                <h3 className="font-semibold text-white">Gemini API Key</h3>
                            </div>
                            <input
                                type="password"
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className="w-full bg-black/30 text-white px-3 py-2 rounded border border-gray-700 outline-none focus:border-primary mb-3"
                            />
                            <button
                                onClick={saveApiKey}
                                className="w-full bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded font-medium transition-colors"
                            >
                                Save Key
                            </button>
                            <p className="text-xs text-muted mt-2">
                                Get your key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                            </p>
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysisResult && (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                                <button
                                    onClick={handleRetake}
                                    className="text-sm text-muted hover:text-white transition-colors"
                                >
                                    Take New Photo
                                </button>
                            </div>

                            {/* Stagnant Items */}
                            <div className="bg-surface rounded-xl border border-yellow-500/30 p-5">
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-yellow-500" />
                                    Items That Haven't Moved (1 Month)
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.stagnantItems.length > 0 ? (
                                        analysisResult.stagnantItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-400 italic">Great! No stagnant items detected.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Trash Candidates */}
                            <div className="bg-surface rounded-xl border border-red-500/30 p-5">
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                    <Target size={18} className="text-red-500" />
                                    Potential Clutter to Remove
                                </h4>
                                <ul className="space-y-2">
                                    {analysisResult.trashItems.length > 0 ? (
                                        analysisResult.trashItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-400 italic">No obvious clutter detected!</li>
                                    )}
                                </ul>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-5">
                                <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                                    <Lightbulb size={18} className="text-primary" />
                                    Next Month's Goals
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    {analysisResult.stagnantItems.length > 0 && (
                                        <li className="flex items-start gap-2">
                                            <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                            <span>Deal with {analysisResult.stagnantItems.length} stagnant item{analysisResult.stagnantItems.length > 1 ? 's' : ''}</span>
                                        </li>
                                    )}
                                    {analysisResult.trashItems.length > 0 && (
                                        <li className="flex items-start gap-2">
                                            <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                            <span>Remove or organize {analysisResult.trashItems.length} clutter item{analysisResult.trashItems.length > 1 ? 's' : ''}</span>
                                        </li>
                                    )}
                                    <li className="flex items-start gap-2">
                                        <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                        <span>Establish a routine to keep spaces clear</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                        <span>Take next month's photo to track progress</span>
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
