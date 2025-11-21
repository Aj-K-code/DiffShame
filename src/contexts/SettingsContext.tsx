import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    githubToken: string;
    githubUsername: string;
    githubRepo: string;
    geminiApiKey: string;
}

interface SettingsContextType extends Settings {
    saveSettings: (settings: Settings) => void;
    isConfigured: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'diffshame_settings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>({
        githubToken: '',
        githubUsername: '',
        githubRepo: '',
        geminiApiKey: '',
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
            try {
                setSettings(JSON.parse(storedSettings));
            } catch (e) {
                console.error('Failed to parse settings from local storage', e);
            }
        }
    }, []);

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    };

    const isConfigured = Boolean(
        settings.githubToken &&
        settings.githubUsername &&
        settings.githubRepo &&
        settings.geminiApiKey
    );

    return (
        <SettingsContext.Provider value={{ ...settings, saveSettings, isConfigured }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
