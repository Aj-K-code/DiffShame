import React from 'react';
import { Upload, FolderOpen, Image as ImageIcon, Calendar } from 'lucide-react';

const SECTIONS = ['Door', 'Desktop', 'Bed', 'Couch', 'Workdesk'];

export const CameraView: React.FC = () => {
    return (
        <div className="flex flex-col h-full p-6 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">📸 Photo Upload Instructions</h1>
                <p className="text-muted">Manually add your photos to track changes over time</p>
            </div>

            {/* Folder Structure Card */}
            <div className="bg-surface rounded-xl border border-gray-800 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <FolderOpen className="text-primary" size={24} />
                    <h2 className="text-xl font-semibold text-white">Folder Structure</h2>
                </div>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
                    <pre>{`public/photos/
├── 2025-01/
│   ├── Door.jpg
│   ├── Desktop.jpg
│   ├── Bed.jpg
│   ├── Couch.jpg
│   └── Workdesk.jpg
├── 2024-12/
│   ├── Door.jpg
│   ├── Desktop.jpg
│   └── ...
└── 2024-11/
    └── ...`}</pre>
                </div>
            </div>

            {/* Sections Card */}
            <div className="bg-surface rounded-xl border border-gray-800 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <ImageIcon className="text-primary" size={24} />
                    <h2 className="text-xl font-semibold text-white">Required Sections</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SECTIONS.map(section => (
                        <div
                            key={section}
                            className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-4 text-center"
                        >
                            <p className="font-medium text-white">{section}</p>
                            <p className="text-xs text-muted mt-1">{section}.jpg</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Naming Convention Card */}
            <div className="bg-surface rounded-xl border border-gray-800 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-primary" size={24} />
                    <h2 className="text-xl font-semibold text-white">Naming Convention</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                            <p className="text-white font-medium">Format: <code className="text-primary">YYYY-MM/SectionName.jpg</code></p>
                            <p className="text-sm text-muted mt-1">Month format: Year-Month (e.g., 2025-01 for January 2025)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                            <p className="text-white font-medium">Examples:</p>
                            <ul className="text-sm text-muted mt-2 space-y-1">
                                <li><code>2025-01/Door.jpg</code></li>
                                <li><code>2025-01/Desktop.jpg</code></li>
                                <li><code>2024-12/Bed.jpg</code></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                        <div>
                            <p className="text-white font-medium">Important:</p>
                            <p className="text-sm text-muted mt-1">Section names must match exactly (case-sensitive)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Upload className="text-primary" size={24} />
                    <h2 className="text-xl font-semibold text-white">Photography Tips</h2>
                </div>
                <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                        <span className="text-primary">•</span>
                        <span>Take photos from the same angle each time for better comparisons</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary">•</span>
                        <span>Use consistent lighting conditions</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary">•</span>
                        <span>Keep the camera at the same height</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary">•</span>
                        <span>Try to capture the same area in each photo</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
