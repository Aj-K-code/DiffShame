import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { CameraView } from './components/Camera/CameraView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text">
        <Routes>
          <Route path="/" element={<CameraView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
