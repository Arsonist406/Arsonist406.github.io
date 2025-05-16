import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../firebase-config';
import {getAuth} from 'firebase/auth';

import Header from '../components/Header';
import Footer from '../components/Footer';

import '../styles/main.css';
import '../styles/single-training-program.css';

const SingleTrainingProgramPage = () => {
    const { id } = useParams();
    const [training, setTraining] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTraining = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            try {
                const publicRef = doc(db, 'trainings', id);
                const publicSnap = await getDoc(publicRef);

                if (publicSnap.exists()) {
                    setTraining(publicSnap.data());
                } else if (user) {
                    // Спроба отримати користувацьке тренування
                    const userRef = doc(db, 'users', user.uid, 'trainings', id);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        setTraining(userSnap.data());
                    } else {
                        console.warn('Тренування не знайдено');
                    }
                }
            } catch (error) {
                console.error('Помилка завантаження тренування:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTraining();
    }, [id]);

    if (loading) return <div>Завантаження...</div>;
    if (!training) return <div>Тренування не знайдено.</div>;

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

                        {training.videoId && (
                            <div className="video-container">
                                {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
                                <iframe
                                    width="100%"
                                    height="500"
                                    src={`https://www.youtube.com/embed/${training.videoId}`}
                                    frameBorder="0"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        <div className="training-content">
                            <h1>{training.title}</h1>
                            {training.content ? (
                                <div dangerouslySetInnerHTML={{ __html: training.content }} />
                            ) : (
                                <p>{training.shortDescription}</p>
                            )}
                        </div>
                    </div>

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default SingleTrainingProgramPage;
