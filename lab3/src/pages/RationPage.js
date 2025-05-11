// pages/RationPage.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/common-header.css';
import '../styles/ration.css';

const RationPage = () => {
    const [rations, setRations] = useState([]);

    useEffect(() => {
        document.title = 'Ration';

        fetch('/resources/data/rations.json')
            .then(response => response.json())
            .then(data => setRations(data.rations))
            .catch(error => console.error('Помилка завантаження раціонів:', error));
    }, []);

    const downloadRationTxt = (ration) => {
        let fileName;

        if (ration.title === "«Здоров'я та Баланс»") {
            fileName = 'health-plan.txt';
        } else if (ration.title === "«Сила та Рість»") {
            fileName = 'muscle-gain.txt';
        } else if (ration.title === "«Легкість та Форма»") {
            fileName = 'weight-loss.txt';
        } else {
            console.error('Невідомий раціон:', ration.title);
            return;
        }

        const link = document.createElement('a');
        link.href = `/resources/text/${fileName}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
