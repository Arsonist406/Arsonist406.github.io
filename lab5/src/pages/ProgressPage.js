import React, {useCallback, useEffect, useState} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/progress.css';
import {collection, doc, getDocs, orderBy, query, runTransaction, where} from 'firebase/firestore';
import {auth, db} from '../firebase-config';
import {ENDPOINTS} from "../static/static";
import {addTraining, fetchTrainings} from "../api/apiClient";

const ProgressPage = (callback, deps) => {
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

    const loadTrainings = useCallback(async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            const data = await fetchTrainings(userId);
            setTrainingLogs(data);
        } catch (error) {
            console.error('Помилка:', error);
        }
    }, []);

    useEffect(() => {
        loadTrainings();
    }, [loadTrainings])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addTraining(auth.currentUser.uid, {
                type: trainingForm.type,
                startTime: trainingForm.startTime,
                endTime: trainingForm.endTime,
            });
            await loadTrainings();
        } catch (error) {
            console.error('Помилка:', error);
        }
    };

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

    const formatDateTime = (oldDate) => {
        const newDate = new Date(oldDate);
        return newDate.toLocaleString('uk-UA')
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Закінчене': return '#888';
            case 'Триває': return '#4CAF50';
            case 'Заплановане': return '#2196F3';
            default: return '#000';
        }
    };

    const determineTrainingStatus = (startTime, endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const start = new Date(startTime);

        if (now > end) {
            return 'Закінчене';
        } else if (now >= start) {
            return 'Триває';
        } else {
            return 'Заплановане';
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
                        {trainingLogs.map((training) => (
                            <div key={training.id} className="training-item">
                                <div style={{ padding: '15px', margin: '10px', boxShadow: '0 0 4px rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
                                    <p><strong>Тип:</strong> {training.type}</p>
                                    <p><strong>Початок:</strong> {formatDateTime(training.startTime)}</p>
                                    <p><strong>Кінець:</strong> {formatDateTime(training.endTime)}</p>
                                    <p><strong>Статус: </strong>
                                        <span className="status" style={{color:
                                                getStatusColor(determineTrainingStatus(training.startTime, training.endTime)) }}>
                                            {determineTrainingStatus(training.startTime, training.endTime)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-training">
                        <form id="training-form" onSubmit={handleSubmit} style={{ padding: '20px' }}>
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
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background:'#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Додати тренування
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