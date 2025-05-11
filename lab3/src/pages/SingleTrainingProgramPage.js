// pages/SingleTrainingProgramPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/single-training-program.css';

const SingleTrainingProgramPage = () => {
    const { id } = useParams();
    const [training, setTraining] = useState(null);

    useEffect(() => {
        fetch('/resources/data/trainings.json')
            .then(response => response.json())
            .then(data => {
                const foundTraining = data.trainings.find(t => t.id === id);
                setTraining(foundTraining);
            })
            .catch(error => console.error('Помилка завантаження тренування:', error));
    }, [id]);

    if (!training) return <div>Завантаження...</div>;

    return (
        <div>
            <div className="container">
                <div className="background-image training-left-image"></div>
                <div className="background-image training-right-image"></div>

                <div className="single-training-center-box">
                    <Header />

                    <div className="single-training-container">
                        <Link to="/training-programs" className="back-button">
                            ← Назад до тренувань
                        </Link>

                        <div className="video-container">
                            <iframe
                                width="100%"
                                height="500"
                                src={`https://www.youtube.com/embed/${training.videoId}`}
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <div className="training-content">
                            <h1>{training.title}</h1>
                            <div dangerouslySetInnerHTML={{ __html: training.content }} />
                        </div>
                    </div>

                    <Footer/>
                </div>
            </div>
        </div>
    );
};

export default SingleTrainingProgramPage;