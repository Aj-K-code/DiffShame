import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CameraView } from './components/Camera/CameraView';
import { CompareView } from './components/Comparison/CompareView';
import { Upload, History } from 'lucide-react';
import { clsx } from 'clsx';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Upload, label: 'Instructions' },
    { path: '/compare', icon: History, label: 'Compare' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 pb-safe-area">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              location.pathname === path ? "text-primary" : "text-muted hover:text-gray-300"
            )}
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text pb-20">
      <Routes>
        <Route path="/" element={<CameraView />} />
        <Route path="/compare" element={<CompareView />} />
      </Routes>
      <Navigation />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
