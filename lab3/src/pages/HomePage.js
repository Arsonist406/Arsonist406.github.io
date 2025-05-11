import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import '../styles/home.css';

const HomePage = () => {
    useEffect(() => {
        document.title = "Healthy Life - Home";
    }, []);

    return (
        <div>
            <div className="container">
                <div className="background-image home-left-image"></div>
                <div className="background-image home-right-image"></div>

                <div className="home-center-box">
                    <div className="home-header">
                        <Link to="/">
                            <img src="/resources/image/site-logo.png" alt="Healthy Life"/>
                            <div className="text">Мій Прогрес</div>
                        </Link>
                    </div>

                    <div className="content progress1">
                        <Link to="/progress">
                            <img src="/resources/image/home/progress-home-blur-1px.jpg" alt="Progress page"/>
                            <div className="text">Мій Прогрес</div>
                        </Link>
                    </div>
                    <div className="content ration">
                        <Link to="/ration">
                            <img src="/resources/image/home/ration-home-blur-1px.jpg" alt="Ration page"/>
                            <div className="text">Раціони</div>
                        </Link>
                    </div>
                    <div className="content exercises">
                        <Link to="/training-programs">
                            <img src="/resources/image/home/gym-home-blur-1px.jpg" alt="Exercises page"/>
                            <div className="text">Доступні програми тренування</div>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default HomePage;