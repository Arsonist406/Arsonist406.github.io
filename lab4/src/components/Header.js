
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/main.css';
import '../styles/common-header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isProfilePage = location.pathname === '/profile';

    return (
        <div className={`common-header ${isProfilePage ? 'profile-page' : ''}`}>
            <Link to="/">
                <img className="logo" src="/resources/image/site-logo.png" alt="Healthy Life" />
            </Link>

            <div className={`menu-button ${isProfilePage ? 'profile-page-menu' : ''}`} onClick={toggleMenu}>
                <img src="/resources/image/menu-button.png" alt="Menu button" />
                {isMenuOpen && (
                    <div className="menu">
                        {user && (
                            <>
                                <Link to="/progress" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                                    Прогрес
                                </Link>
                            </>
                        )}
                        <Link to="/ration" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                            Раціон
                        </Link>
                        <Link to="/training-programs" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                            Тренувальні програми
                        </Link>
                    </div>
                )}
            </div>

            {!isProfilePage && (
                <div className="auth-button">
                    {user ? (
                        <Link to="/profile">
                            <img
                                src={user.photoURL || "/resources/image/default-avatar.png"}
                                alt="User profile"
                                className="user-avatar"
                            />
                        </Link>
                    ) : (
                        <Link to="/auth">
                            <img src="/resources/image/auth-button.jpg" alt="Auth button" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;