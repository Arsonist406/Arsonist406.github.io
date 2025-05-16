import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {auth} from '../firebase-config';
import {onAuthStateChanged} from 'firebase/auth';
import Footer from '../components/Footer';
import '../styles/home.css';
import {ENDPOINTS} from "../static/static";

const HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        document.title = "Healthy Life - Home";

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <div className="container">
                <div className="background-image home-left-image"></div>
                <div className="background-image home-right-image"></div>

                {isLoggedIn ? (
                    <>
                        <div className="home-center-box-auth">
                            <div className="home-header">
                                <Link to="/">
                                    <img src={ENDPOINTS.STATIC("site-logo.png")} alt="Healthy Life"/>
                                    <div className="text">Healthy Life</div>
                                </Link>
                            </div>

                            <div className="content profile-block-auth">
                                <Link to="/profile">
                                    <img src={ENDPOINTS.STATIC("home/profile-home.png")} alt="Profile"/>
                                    <div className="text">Мій Профіль</div>
                                </Link>
                            </div>
                            <div className="content progress-auth">
                                <Link to="/progress">
                                    <img src={ENDPOINTS.STATIC("home/progress-home.jpg")} alt="Progress"/>
                                    <div className="text">Мій Прогрес</div>
                                </Link>
                            </div>
                            <div className="content exercises-auth">
                                <Link to="/training-programs">
                                    <img src={ENDPOINTS.STATIC("home/gym-home-auth.jpg")} alt="Exercises"/>
                                    <div className="text">Тренування</div>
                                </Link>
                            </div>
                            <div className="content ration-auth">
                                <Link to="/ration">
                                    <img src={ENDPOINTS.STATIC("home/ration-home.jpg")} alt="Ration"/>
                                    <div className="text">Раціони</div>
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="home-center-box-not-auth">
                            <div className="home-header">
                                <Link to="/">
                                    <img src={ENDPOINTS.STATIC("site-logo.png")} alt="Healthy Life"/>
                                    <div className="text">Healthy Life</div>
                                </Link>
                            </div>
                            <div className="content auth">
                                <Link to="/auth">
                                    <img src={ENDPOINTS.STATIC("auth-button.jpg")} alt="Auth"/>
                                    <div className="text">Вхід/Реєстрація</div>
                                </Link>
                            </div>
                            <div className="content exercises-not-auth">
                                <Link to="/training-programs">
                                    <img src={ENDPOINTS.STATIC("home/gym-home-not-auth.jpg")} alt="Exercises"/>
                                    <div className="text">Тренування</div>
                                </Link>
                            </div>
                            <div className="content ration-not-auth">
                                <Link to="/ration">
                                    <img src={ENDPOINTS.STATIC("home/ration-home.jpg")} alt="Ration"/>
                                    <div className="text">Раціони</div>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <Footer/>
        </div>
    );
};

export default HomePage;