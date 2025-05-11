import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/training-programs.css';

const TrainingProgramsPage = () => {
    const [trainings, setTrainings] = useState([]);
    const [filteredTrainings, setFilteredTrainings] = useState([]);
    const [selectedComplexity, setSelectedComplexity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        document.title = 'Training-Programs';

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            try {
                const globalTrainingsSnapshot = await getDocs(collection(db, 'trainings'));
                const globalTrainings = globalTrainingsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    isPersonal: false
                }));

                let personalTrainings = [];
                if (currentUser) {
                    const personalTrainingsSnapshot = await getDocs(collection(db, 'users', currentUser.uid, 'trainings'));
                    personalTrainings = personalTrainingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        isPersonal: true
                    }));
                }

                const allTrainings = [...globalTrainings, ...personalTrainings];
                setTrainings(allTrainings);
                setFilteredTrainings(allTrainings);
            } catch (error) {
                console.error('Помилка завантаження тренувань:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        let filtered = trainings;

        if (selectedComplexity) {
            filtered = filtered.filter(training => training.complexity === selectedComplexity);
        }

        if (selectedCategory) {
            filtered = filtered.filter(training => training.category === selectedCategory);
        }

        setFilteredTrainings(filtered);
    }, [selectedComplexity, selectedCategory, trainings]);

    const handleComplexityFilter = (complexity) => {
        setSelectedComplexity(complexity === selectedComplexity ? '' : complexity);
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    const categories = [...new Set(trainings.map(training => training.category))];
    const complexities = ['Низька', 'Середня', 'Висока'];

    if (loading) return <div className="loading">Завантаження...</div>;

    return (
        <div>
            <div className="container">
                <div className="background-image training-left-image"></div>
                <div className="background-image training-right-image"></div>

                <div className="training-center-box">
                    <Header />

                    <div className="filter-buttons">
                        <div className="filter-dropdown">
                            <button className="filter-main-button">
                                Фільтр за складністю
                                {selectedComplexity && <span> ({selectedComplexity})</span>}
                            </button>
                            <div className="dropdown-content">
                                <button
                                    className={`filter-option ${selectedComplexity === '' ? 'active' : ''}`}
                                    onClick={() => handleComplexityFilter('')}
                                >
                                    Усі
                                </button>
                                {complexities.map(complexity => (
                                    <button
                                        key={complexity}
                                        className={`filter-option ${selectedComplexity === complexity ? 'active' : ''}`}
                                        onClick={() => handleComplexityFilter(complexity)}
                                    >
                                        {complexity}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-dropdown">
                            <button className="filter-main-button">
                                Фільтр за категорією
                                {selectedCategory && <span> ({selectedCategory})</span>}
                            </button>
                            <div className="dropdown-content">
                                <button
                                    className={`filter-option ${selectedCategory === '' ? 'active' : ''}`}
                                    onClick={() => handleCategoryFilter('')}
                                >
                                    Усі
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                                        onClick={() => handleCategoryFilter(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user && (
                            <Link to="/create-training" className="create-training-button">
                                Створити тренування
                            </Link>
                        )}
                    </div>

                    <div className="training-grid">
                        {filteredTrainings.length > 0 ? (
                            filteredTrainings.map((training) => (
                                <Link
                                    to={`/training-programs/${training.id}`}
                                    key={`${training.isPersonal ? 'user-' : 'global-'}${training.id}`}
                                    className="training-card"
                                >
                                    <div className="card-image">
                                        <img
                                            src={`/resources/image/exercises/preview/${training.previewImage}`}
                                            alt={training.title}
                                        />
                                    </div>
                                    <h3>{training.title}</h3>
                                    <p>{training.shortDescription}</p>
                                    <p>
                                        <strong>Складність:</strong> {training.complexity}<br />
                                        <strong>Категорія:</strong> {training.category}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Тренування не знайдено. Спробуйте змінити фільтри.</p>
                            </div>
                        )}
                    </div>

                    <div className="training-text">
                        <h3>Корисна інформація</h3>
                    </div>

                    <div className="additional-video">
                        <div className="video video_4">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/Z-TQyH-8ipA?si=txypNF4nsb5utC7l"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="video video_5">
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/aAAD-qh6j-U?si=tRJHBw2wSrdO-0ic"
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TrainingProgramsPage;
