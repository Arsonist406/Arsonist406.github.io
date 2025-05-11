// pages/ProgressPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/progress.css';

const ProgressPage = () => {
    // Walking progress state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progressData, setProgressData] = useState([]);

    // Training log state
    const [trainingLogs, setTrainingLogs] = useState([]);
    const [trainingForm, setTrainingForm] = useState({
        type: '',
        startTime: '',
        endTime: ''
    });

    // Achievements state
    const [achievements, setAchievements] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        document.title = "MyProgress";

        // Fetch walking progress data
        fetch('/resources/data/progress/walking-progress.json')
            .then(response => response.json())
            .then(data => {
                setProgressData(data.dates);
            })
            .catch(error => console.error('Помилка завантаження даних:', error));

        // Fetch achievements data
        fetch('/resources/data/progress/achievements.json')
            .then(response => response.json())
            .then(data => {
                setAchievements(data.achievements);
            })
            .catch(error => console.error('Помилка завантаження досягнень:', error));
    }, []);

    // Handle arrow clicks for walking progress
    const handleArrowClick = (direction) => {
        if (direction === 'left' && currentIndex < progressData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else if (direction === 'right' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Handle training form input changes
    const handleTrainingFormChange = (e) => {
        const { name, value } = e.target;
        setTrainingForm({
            ...trainingForm,
            [name]: value
        });
    };

    // Handle training form submission
    const handleTrainingSubmit = (e) => {
        e.preventDefault();

        const startTime = new Date(trainingForm.startTime);
        const endTime = new Date(trainingForm.endTime);

        if (startTime >= endTime) {
            alert('Час початку повинен бути раніше за час завершення!');
            return;
        }

        const now = new Date();
        let status;

        if (now > endTime) {
            status = 'закінчене';
        } else if (now >= startTime) {
            status = 'триває';
        } else {
            status = 'заплановане';
        }

        const newTraining = {
            type: trainingForm.type,
            startTime,
            endTime,
            status
        };

        setTrainingLogs([...trainingLogs, newTraining].sort((a, b) => b.startTime - a.startTime));
        setTrainingForm({
            type: '',
            startTime: '',
            endTime: ''
        });
    };

    // Format date for display
    const formatDateTime = (date) => {
        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch(status) {
            case 'закінчене': return '#888';
            case 'триває': return '#4CAF50';
            case 'заплановане': return '#2196F3';
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
                            <p id="goal">{progressData[currentIndex]?.goal || ''}</p>
                            <h4>✅Зроблено кроків✅</h4>
                            <p id="steps">{progressData[currentIndex]?.steps || ''}</p>
                            <h4>🚶Пройдена відстань🚶</h4>
                            <p id="distance">{progressData[currentIndex]?.distance || ''}</p>
                            <h4>🔥Спалено калорій🔥</h4>
                            <p id="calories">{progressData[currentIndex]?.calories || ''}</p>
                        </div>

                        <div className="progress">
                            <div className="date">{progressData[currentIndex]?.date || ''}</div>

                            <div
                                className="progress-ring"
                                style={{
                                    background: progressData[currentIndex] ?
                                        `conic-gradient(#4CAF50 0%, #4CAF50 ${progressData[currentIndex].progress}%, #eee ${progressData[currentIndex].progress}%, #eee 100%)` :
                                        ''
                                }}
                            >
                                <div className="progress-overlay"></div>
                                <p className="progress-ring-text">
                                    {progressData[currentIndex] ? `${progressData[currentIndex].progress}%` : ''}
                                </p>
                            </div>

                            <button className="arrow arrow-left" onClick={() => handleArrowClick('left')}>←</button>
                            <button className="arrow arrow-right" onClick={() => handleArrowClick('right')}>→</button>
                        </div>
                    </div>

                    <div className="training-log">
                        {trainingLogs.map((training, index) => (
                            <div key={index} className="training-item">
                                <div style={{ padding: '15px', margin: '10px', boxShadow: '0 0 4px rgba(0,0,0,0.2)', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
                                    <p><strong>Тип:</strong> {training.type}</p>
                                    <p><strong>Початок:</strong> {formatDateTime(training.startTime)}</p>
                                    <p><strong>Кінець:</strong> {formatDateTime(training.endTime)}</p>
                                    <p><strong>Статус:</strong> <span className="status" style={{ color: getStatusColor(training.status) }}>{training.status}</span></p>
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
                                style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
                            >
                                Додати тренування
                            </button>
                        </form>
                    </div>

                    <div className="achievements-area">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="achievement">
                                <img src={achievement.icon} alt="Досягнення" />
                                <div className="progress-text">{achievement.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        <Footer/>
    </div>
    );
};

export default ProgressPage;