import React, {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../firebase-config';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/ration.css';

const RationPage = () => {
    const [rations, setRations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Ration';
        fetchRationsFromFirestore();
    }, []);

    const fetchRationsFromFirestore = async () => {
        try {
            const rationsCollection = collection(db, 'rations');
            const snapshot = await getDocs(rationsCollection);

            const rationsData = await Promise.all(
                snapshot.docs.map(async (doc) => {
                    const rationData = doc.data();
                    const daysSnapshot = await getDocs(collection(db, `rations/${doc.id}/days`));
                    const days = daysSnapshot.docs.map(dayDoc => dayDoc.data());
                    return {
                        ...rationData,
                        days
                    };
                })
            );

            setRations(rationsData);
            setLoading(false);
        } catch (err) {
            console.error('Помилка завантаження раціонів:', err);
            setError('Не вдалося завантажити дані');
            setLoading(false);
        }
    };

    const downloadRationTxt = (ration) => {
        let fileName;
        const rationTitles = {
            "«Здоров'я та Баланс»": 'health-plan.txt',
            "«Сила та Ріст»": 'muscle-gain.txt',
            "«Легкість та Форма»": 'weight-loss.txt'
        };

        fileName = rationTitles[ration.title];
        if (!fileName) {
            console.error('Невідомий раціон:', ration.title);
            return;
        }

        // Створення текстового файлу на льоту
        const content = generateRationTextContent(ration);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateRationTextContent = (ration) => {
        let content = `${ration.title}\n${ration.subtitle}\n\n`;

        ration.days.forEach(day => {
            content += `${day.day}\n`;
            day.meals.forEach(meal => {
                content += `- ${meal.meal}\n  ${meal.calories}\n`;
            });
            content += `Загалом: ${day.total}\n\n`;
        });

        return content;
    };

    if (loading) {
        return <div className="loading">Завантаження даних...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div>
            <div className="container">
                <div className="background-image ration-left-image"></div>
                <div className="background-image ration-right-image"></div>

                <div className="ration-center-box">
                    <Header />

                    <div className="ration-container">
                        {rations.map((ration, index) => (
                            <div
                                key={index}
                                className={`plan plan_${index + 1}`}
                                onClick={() => downloadRationTxt(ration)}
                            >
                                <h2 style={{ textAlign: 'center' }}>{ration.title}</h2>
                                <p style={{ textAlign: 'center' }}>{ration.subtitle}</p>

                                {ration.days.map((day, idx) => (
                                    <div key={idx}>
                                        <h4>{day.day}</h4>
                                        {day.meals.map((meal, mealIdx) => (
                                            <div key={mealIdx}>
                                                <p>{meal.meal}</p>
                                                <p><i>{meal.calories}</i></p>
                                            </div>
                                        ))}
                                        <p>Загалом: <i>{day.total}</i></p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="ration-info">
                        <h4>Щоб зберегти раціон - натисніть на нього</h4>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default RationPage;