// components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="common-header">
            <Link to="/">
                <img className="logo" src="/resources/image/site-logo.png" alt="Healthy Life" />
            </Link>

            <div className="menu-button" onClick={toggleMenu}>
                <img src="/resources/image/menu-button.png" alt="Menu button" />
                {isMenuOpen && (
                    <div className="menu">
                        <Link to="/progress" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                            Прогрес
                        </Link>
                        <Link to="/ration" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                            Раціон
                        </Link>
                        <Link to="/training-programs" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                            Тренувальні програми
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;