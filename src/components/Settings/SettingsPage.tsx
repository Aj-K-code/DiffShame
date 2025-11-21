import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Save, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const SettingsPage: React.FC = () => {
    const { githubToken, githubUsername, githubRepo, geminiApiKey, saveSettings } = useSettings();

    const [formData, setFormData] = useState({
        githubToken: '',
        githubUsername: '',
        githubRepo: '',
        geminiApiKey: '',
    });

    const [status, setStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        setFormData({
            githubToken,
            githubUsername,
            githubRepo,
            geminiApiKey,
        });
    }, [githubToken, githubUsername, githubRepo, geminiApiKey]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setStatus('idle');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveSettings(formData);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-surface p-6 rounded-lg border border-gray-800 space-y-6">
                    <h2 className="text-xl font-semibold text-primary mb-4">GitHub Configuration</h2>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Personal Access Token
                        </label>
                        <input
                            type="password"
                            name="githubToken"
                            value={formData.githubToken}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="ghp_..."
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Requires <code className="bg-gray-800 px-1 rounded">repo</code> or <code className="bg-gray-800 px-1 rounded">public_repo</code> scope.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                GitHub Username
                            </label>
                            <input
                                type="text"
                                name="githubUsername"
                                value={formData.githubUsername}
                                onChange={handleChange}
                                className="w-full bg-background border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Repository Name
                            </label>
                            <input
                                type="text"
                                name="githubRepo"
                                value={formData.githubRepo}
                                onChange={handleChange}
                                className="w-full bg-background border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="my-room-tracker"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg border border-gray-800 space-y-6">
                    <h2 className="text-xl font-semibold text-accent mb-4">AI Configuration</h2>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            name="geminiApiKey"
                            value={formData.geminiApiKey}
                            onChange={handleChange}
                            className="w-full bg-background border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="AIza..."
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Get your key from Google AI Studio.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center text-yellow-500 text-sm">
                        <AlertCircle size={16} className="mr-2" />
                        <span>Keys are stored locally in your browser.</span>
                    </div>

                    <button
                        type="submit"
                        className={clsx(
                            "flex items-center px-6 py-2 rounded-md font-medium transition-all",
                            status === 'saved'
                                ? "bg-green-600 text-white"
                                : "bg-primary hover:bg-blue-600 text-white"
                        )}
                    >
                        <Save size={18} className="mr-2" />
                        {status === 'saved' ? 'Saved!' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};
