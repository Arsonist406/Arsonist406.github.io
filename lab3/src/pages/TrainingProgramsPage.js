import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/training-programs.css';

const TrainingProgramsPage = () => {
    const [trainings, setTrainings] = useState([]);
    const [filteredTrainings, setFilteredTrainings] = useState([]);
    const [selectedComplexity, setSelectedComplexity] = useState('');

    useEffect(() => {
        document.title = 'Training-Programs';

        fetch('/resources/data/trainings.json')
            .then(response => response.json())
            .then(data => {
                setTrainings(data.trainings);
                setFilteredTrainings(data.trainings);
            })
            .catch(error => console.error('Помилка завантаження тренувань:', error));
    }, []);

    const complexStyle = {
        paddingTop: "5px",
        paddingBottom: "15px"
    };

    const handleFilterChange = (complexity) => {
        setSelectedComplexity(complexity);
        if (complexity === '') {
            setFilteredTrainings(trainings);
        } else {
            const filtered = trainings.filter(training => training.complexity === complexity);
            setFilteredTrainings(filtered);
        }
    };

    return (
        <div>
            <div className="container">
                <div className="background-image training-left-image"></div>
                <div className="background-image training-right-image"></div>

                <div className="training-center-box">
                    <Header />

                    <div className="filter-buttons">
                        <button onClick={() => handleFilterChange('')}>Усі</button>
                        <button onClick={() => handleFilterChange('Низька складність')}>Низька складність</button>
                        <button onClick={() => handleFilterChange('Середня складність')}>Середня складність</button>
                        <button onClick={() => handleFilterChange('Висока складність')}>Висока складність</button>
                    </div>

                    <div className="training-grid">
                        {filteredTrainings.map((training) => (
                            <Link
                                to={`/training-programs/${training.id}`}
                                key={training.id}
                                className="training-card"
                            >
                                <div className="card-image">
                                    <img
                                        src={`/resources/image/exercises/${training.previewImage}`}
                                        alt={training.title}
                                    />
                                </div>
                                <h3>{training.title}</h3>
                                <p>{training.shortDescription}</p>
                                <p style={complexStyle}>{training.complexity}</p>
                            </Link>
                        ))}
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
            <Footer/>
        </div>
    );
};

export default TrainingProgramsPage;
