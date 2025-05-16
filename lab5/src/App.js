import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProgressPage from './pages/ProgressPage';
import RationPage from './pages/RationPage';
import TrainingProgramsPage from './pages/TrainingProgramsPage';
import SingleTrainingProgramPage from './pages/SingleTrainingProgramPage';
import AuthPage from "./pages/AuthPage"
import ProfilePage from "./pages/ProfilePage";
import CreateTrainingPage from "./pages/CreateTrainingPage";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/ration" element={<RationPage />} />
                <Route path="/training-programs" element={<TrainingProgramsPage />} />
                <Route path="/training-programs/:id" element={<SingleTrainingProgramPage />} />
                <Route path="/create-training" element={<CreateTrainingPage />} />
            </Routes>
        </Router>
    );
}

export default App;

