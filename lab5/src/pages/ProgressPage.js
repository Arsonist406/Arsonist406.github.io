
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/progress.css';
import {
    doc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    runTransaction
} from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import {ENDPOINTS} from "../serverURLconfig";

const ProgressPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progressData, setProgressData] = useState({ dates: [] });

    const [trainingLogs, setTrainingLogs] = useState([]);
    const [trainingForm, setTrainingForm] = useState({
        type: '',
        startTime: '',
        endTime: ''
    });

    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const [trainingLoading, setTrainingLoading] = useState(false);
    const [trainingError, setTrainingError] = useState(null);

    const determineTrainingStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now > end) {
            return 'Закінчене';
        } else if (now >= start) {
            return 'Триває';
        } else {
            return 'Заплановане';
        }
    };

    const fetchTrainings = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            setTrainingLoading(true);
            const response = await fetch(ENDPOINTS.TRAININGS_LOG(userId));
            if (!response.ok) {
                throw new Error('Failed to fetch trainings');
            }
            const data = await response.json();

            const trainingsWithStatus = data.map(training => ({
                ...training,
                status: determineTrainingStatus(training.startTime, training.endTime)
            }));

            setTrainingLogs(trainingsWithStatus);
        } catch (error) {
            console.error('Error fetching trainings:', error);
            setTrainingError(error.message);
        } finally {
            setTrainingLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainings();
    }, []);

    useEffect(() => {
        document.title = "MyProgress";

        const loadAllData = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            try {
                setLoading(true);

                await generateDailyWalkingStats(userId);
                const statsRef = collection(db, `users/${userId}/walkingStats`);
                const statsQuery = query(statsRef, orderBy('date', 'desc'));
                const statsSnapshot = await getDocs(statsQuery);
                setProgressData({ dates: statsSnapshot.docs.map(doc => doc.data()) });

                const achievementsRef = collection(db, `users/${userId}/achievements`);
                const achievementsQuery = query(achievementsRef);
                const achievementsSnapshot = await getDocs(achievementsQuery);
                setAchievements(achievementsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));

            } catch (error) {
                console.error('Помилка завантаження даних:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            loadAllData();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const loadAchievements = async () => {
            try {
                const achievementsRef = collection(db, 'achievements');
                const q = query(achievementsRef);
                const snapshot = await getDocs(q);

                const achievementsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setAchievements(achievementsData);
            } catch (error) {
                console.error('Помилка завантаження досягнень:', error);
            }
        };

        loadAchievements();
    }, []);

    async function generateDailyWalkingStats(userId) {
        try {
            const today = new Date().toLocaleDateString('uk-UA');
            const walkingStatsRef = collection(db, `users/${userId}/walkingStats`);

            await runTransaction(db, async (transaction) => {
                const todayQuery = query(walkingStatsRef, where('date', '==', today));
                const todaySnapshot = await getDocs(todayQuery);

                if (!todaySnapshot.empty) {
                    console.log('Запис на сьогодні вже існує');
                    return;
                }

                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);
                const dailyGoal = userDoc.data()?.daily_walk_target || 10000;

                const steps = Math.floor(dailyGoal * (0.7 + Math.random() * 0.5));
                const distance = (steps * 0.000762).toFixed(1) + ' км';
                const calories = Math.floor(steps * 0.035) + ' ккал';
                const progress = Math.min(Math.floor((steps / dailyGoal) * 100), 100);

                const statsData = {
                    date: today,
                    goal: dailyGoal,
                    steps,
                    distance,
                    calories,
                    progress,
                    generatedAt: new Date(),
                    generationId: Math.random().toString(36).substring(2, 15)
                };
                const newDocRef = doc(walkingStatsRef);
                transaction.set(newDocRef, statsData);

                console.log('Новий запис успішно створено');
            });
        } catch (error) {
            console.error('Помилка при генерації статистики:', error);
            throw error;
        }
    }

    const handleArrowClick = (direction) => {
        if (direction === 'left' && currentIndex < progressData.dates.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (direction === 'right' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleTrainingFormChange = (e) => {
        const { name, value } = e.target;
        setTrainingForm({
            ...trainingForm,
            [name]: value
        });
    };

    const handleTrainingSubmit = async (e) => {
        e.preventDefault();

        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const startTime = new Date(trainingForm.startTime);
        const endTime = new Date(trainingForm.endTime);

        if (startTime >= endTime) {
            alert('Час початку повинен бути раніше за час завершення!');
            return;
        }

        try {
            setTrainingLoading(true);
            const response = await fetch(ENDPOINTS.TRAININGS_LOG(userId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: trainingForm.type,
                    startTime: trainingForm.startTime,
                    endTime: trainingForm.endTime
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add training');
            }

            // Оновлюємо список тренувань після успішного додавання
            await fetchTrainings();

            setTrainingForm({
                type: '',
                startTime: '',
                endTime: ''
            });
        } catch (error) {
            console.error('Error adding training:', error);
            setTrainingError(error.message);
        } finally {
            setTrainingLoading(false);
        }
    };

    const formatDateTime = (date) => {
        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Закінчене': return '#888';
            case 'Триває': return '#4CAF50';
            case 'Заплановане': return '#2196F3';
            default: return '#000';
        }
    };

    return (
        <div>
            <div className="container">
                <div className="background-image progress-left-image"></div>
                <div className="background-image progress-right-image"></div>

                <div className="progress-center-box">
                    <Header />

                    <div className="walking-info">
                        <div className="info">
                            <h4>✨Ціль✨</h4>
                            <p id="goal">{progressData.dates[currentIndex]?.goal || 'Немає даних'}</p>
                            <h4>✅Зроблено кроків✅</h4>
                            <p id="steps">{progressData.dates[currentIndex]?.steps || 'Немає даних'}</p>
                            <h4>🚶Пройдена відстань🚶</h4>
                            <p id="distance">{progressData.dates[currentIndex]?.distance || 'Немає даних'}</p>
                            <h4>🔥Спалено калорій🔥</h4>
                            <p id="calories">{progressData.dates[currentIndex]?.calories || 'Немає даних'}</p>
                        </div>

                        <div className="progress">
                            <div className="date">{progressData.dates[currentIndex]?.date || 'Немає даних'}</div>

                            <div
                                className="progress-ring"
                                style={{
                                    background: progressData.dates[currentIndex] ?
                                        `conic-gradient(#4CAF50 0%, #4CAF50 ${progressData.dates[currentIndex].progress}%, #eee ${progressData.dates[currentIndex].progress}%, #eee 100%)` :
                                        'conic-gradient(#eee 0%, #eee 100%)'
                                }}
                            >
                                <div className="progress-overlay"></div>
                                <p className="progress-ring-text">
                                    {progressData.dates[currentIndex] ? `${progressData.dates[currentIndex].progress}%` : '0%'}
                                </p>
                            </div>

                            <button
                                className="arrow arrow-left"
                                onClick={() => handleArrowClick('left')}
                                disabled={currentIndex >= progressData.dates.length - 1}
                            >
                                ←
                            </button>
                            <button
                                className="arrow arrow-right"
                                onClick={() => handleArrowClick('right')}
                                disabled={currentIndex <= 0}
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div className="training-log">
                        {trainingLoading && <div className="loading-message">Завантаження тренувань...</div>}
                        {trainingError && <div className="error-message">{trainingError}</div>}

                        {trainingLogs.map((training) => (
                            <div key={training.id} className="training-item">
                                <div style={{ padding: '15px', margin: '10px', boxShadow: '0 0 4px rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
                                    <p><strong>Тип:</strong> {training.type}</p>
                                    <p><strong>Початок:</strong> {formatDateTime(training.startTime)}</p>
                                    <p><strong>Кінець:</strong> {formatDateTime(training.endTime)}</p>
                                    <p><strong>Статус:</strong> <span className="status" style={{ color: getStatusColor(
                                            determineTrainingStatus(training.startTime, training.endTime)) }}>
                                        {determineTrainingStatus(training.startTime, training.endTime)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-training">
                        <form id="training-form" onSubmit={handleTrainingSubmit} style={{ padding: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <label>Тип тренування</label>
                                <select
                                    id="training-type"
                                    name="type"
                                    required
                                    style={{ width: '100%', padding: '8px', fontFamily: 'Arial, sans-serif', marginBottom: '20px', marginTop: '4px' }}
                                    value={trainingForm.type}
                                    onChange={handleTrainingFormChange}
                                >
                                    <option value="" disabled>Оберіть тип</option>
                                    <option value="Силове">Силове</option>
                                    <option value="Кардіо">Кардіо</option>
                                    <option value="Домашнє">Домашнє</option>
                                    <option value="Йога">Йога</option>
                                    <option value="Функціональне">Функціональне</option>
                                    <option value="Розтяжка">Розтяжка</option>
                                </select>
                            </div>

                            <div style={{ marginRight: '20px', textAlign: 'center' }}>
                                <label>Початок</label>
                                <input
                                    type="datetime-local"
                                    id="start-time"
                                    name="startTime"
                                    required
                                    style={{ width: '100%', padding: '8px', fontFamily: 'Arial, sans-serif', marginBottom: '20px', marginTop: '4px' }}
                                    value={trainingForm.startTime}
                                    onChange={handleTrainingFormChange}
                                />
                            </div>

                            <div style={{ marginRight: '20px', textAlign: 'center' }}>
                                <label>Кінець</label>
                                <input
                                    type="datetime-local"
                                    id="end-time"
                                    name="endTime"
                                    required
                                    style={{ width: '100%', padding: '8px', fontFamily: 'Arial, sans-serif', marginBottom: '20px', marginTop: '4px' }}
                                    value={trainingForm.endTime}
                                    onChange={handleTrainingFormChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={trainingLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: trainingLoading ? '#cccccc' : '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: trainingLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {trainingLoading ? 'Додавання...' : 'Додати тренування'}
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="loading-message">Завантаження даних...</div>
                    ) : (
                        <>
                            <div className="achievements-area">
                                {achievements.map((achievement) => (
                                    <div key={achievement.id} className="achievement">
                                        <img
                                            src={ENDPOINTS.STATIC(`progress/icons/${achievement.icon}`)}
                                            alt={achievement.text}
                                        />
                                        <div className="progress-text">{achievement.text}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        <Footer/>
    </div>
    );
};

export default ProgressPage;