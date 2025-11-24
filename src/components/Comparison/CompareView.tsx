
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { GitHubService } from '../../services/github';
import { GeminiService, type AnalysisResult } from '../../services/gemini';
import { Sparkles, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const CompareView: React.FC = () => {
    const { githubToken, githubUsername, githubRepo, geminiApiKey } = useSettings();

    const [sectors] = useState<string[]>(['Desk', 'Bed', 'Closet', 'North Wall']);
    const [selectedSector, setSelectedSector] = useState<string>(sectors[0]);

    const [availableMonths, setAvailableMonths] = useState<string[]>([]);
    const [date1, setDate1] = useState<string>('');
    const [date2, setDate2] = useState<string>('');

    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);

    const [sliderPosition, setSliderPosition] = useState(50);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    // Fetch available months on mount
    useEffect(() => {
        const fetchAvailableMonths = async () => {
            if (!githubToken || !githubUsername || !githubRepo) return;

            const gh = new GitHubService(githubToken, githubUsername, githubRepo);
            const months = await gh.listAvailableMonths();
            setAvailableMonths(months);

            // Auto-select most recent 2 months if available
            if (months.length >= 2) {
                setDate1(months[1]); // Second most recent
                setDate2(months[0]); // Most recent
            } else if (months.length === 1) {
                setDate1(months[0]);
                setDate2(months[0]);
            }
        };

        fetchAvailableMonths();
    }, [githubToken, githubUsername, githubRepo]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!githubToken || !githubUsername || !githubRepo || !date1 || !date2) return;

            const gh = new GitHubService(githubToken, githubUsername, githubRepo);

            try {
                const content1 = await gh.getFileContent(`data/${date1}/${selectedSector}.jpg`);
                setImage1(`data:image/jpeg;base64,${content1}`);
            } catch (e) {
                setImage1(null);
            }

            try {
                const content2 = await gh.getFileContent(`data/${date2}/${selectedSector}.jpg`);
                setImage2(`data:image/jpeg;base64,${content2}`);
            } catch (e) {
                setImage2(null);
            }
        };

        fetchImages();
    }, [selectedSector, date1, date2, githubToken, githubUsername, githubRepo]);

    const handleAnalyze = async () => {
        if (!image1 || !image2 || !geminiApiKey) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const gemini = new GeminiService(geminiApiKey);
            // Strip data URL prefix
            const b64_1 = image1.split(',')[1];
            const b64_2 = image2.split(',')[1];

            const result = await gemini.analyzeImages(b64_2, b64_1); // Compare Current (2) vs Previous (1)
            setAnalysisResult(result);
        } catch (e) {
            console.error("Analysis failed", e);
            alert("Analysis failed. Check console for details.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 max-w-2xl mx-auto w-full">
            <div className="mb-6 space-y-4">
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
                </div>

                <div className="flex items-center justify-between gap-4 bg-surface p-3 rounded-lg border border-gray-800">
                    <select
                        value={date1}
                        onChange={(e) => setDate1(e.target.value)}
                        className="bg-transparent text-white outline-none text-sm cursor-pointer flex-1"
                        disabled={availableMonths.length === 0}
                    >
                        {availableMonths.length === 0 ? (
                            <option>No data available</option>
                        ) : (
                            availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </option>
                            ))
                        )}
                    </select>
                    <ArrowRight size={16} className="text-muted flex-shrink-0" />
                    <select
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                        className="bg-transparent text-white outline-none text-sm text-right cursor-pointer flex-1"
                        disabled={availableMonths.length === 0}
                    >
                        {availableMonths.length === 0 ? (
                            <option>No data available</option>
                        ) : (
                            availableMonths.map(month => (
                                <option key={month} value={month}>
                                    {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800 mb-6 group select-none">
                {!image1 || !image2 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted p-8 text-center">
                        <p className="text-lg mb-2">No images to compare</p>
                        {availableMonths.length === 0 ? (
                            <p className="text-sm">Take your first photo in the Camera tab to get started!</p>
                        ) : (
                            <p className="text-sm">Select different months with photos for this sector</p>
                        )}
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
                                style={{ width: '100vw', maxWidth: '42rem' }} // Hacky fix for aspect ratio in this container
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

            <div className="flex justify-center mb-8">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !image1 || !image2}
                    className={clsx(
                        "flex items-center px-6 py-3 rounded-full font-medium transition-all shadow-lg shadow-primary/20",
                        isAnalyzing
                            ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-primary to-accent text-white hover:scale-105"
                    )}
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} className="mr-2" />
                            Analyze Changes
                        </>
                    )}
                </button>
            </div>

            {analysisResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-surface rounded-xl border border-gray-800 p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <AlertTriangle size={20} className="text-yellow-500 mr-2" />
                            Stagnant Items
                            <span className="ml-auto text-xs font-normal text-muted bg-gray-800 px-2 py-1 rounded">
                                {analysisResult.stagnantItems.length} items
                            </span>
                        </h3>
                        <ul className="space-y-2">
                            {analysisResult.stagnantItems.map((item, i) => (
                                <li key={i} className="flex items-start text-gray-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                            {analysisResult.stagnantItems.length === 0 && (
                                <li className="text-muted text-sm italic">No stagnant items detected. Great job!</li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-surface rounded-xl border border-gray-800 p-5">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Trash2 size={20} className="text-red-500 mr-2" />
                            Trash Candidates
                            <span className="ml-auto text-xs font-normal text-muted bg-gray-800 px-2 py-1 rounded">
                                {analysisResult.trashItems.length} items
                            </span>
                        </h3>
                        <ul className="space-y-2">
                            {analysisResult.trashItems.map((item, i) => (
                                <li key={i} className="flex items-start text-gray-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                            {analysisResult.trashItems.length === 0 && (
                                <li className="text-muted text-sm italic">No trash detected. Clean room!</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
