
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProgressPage from './pages/ProgressPage';
import RationPage from './pages/RationPage';
import TrainingProgramsPage from './pages/TrainingProgramsPage';
import SingleTrainingProgramPage from './pages/SingleTrainingProgramPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/ration" element={<RationPage />} />
                <Route path="/training-programs" element={<TrainingProgramsPage />} />
                <Route path="/training-programs/:id" element={<SingleTrainingProgramPage />} />
            </Routes>
        </Router>
    );
}

export default App;

