import React from 'react';
import '../styles/main.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-name">
                <p>&copy; 2025 Healthy Life</p>
            </div>
            <div className="footer-links">
                <a href="mailto:ostap06seniv@gmail.com" target="_blank" rel="noopener noreferrer">Gmail</a>
                <a href="https://t.me/arsonist406" target="_blank" rel="noopener noreferrer">Telegram</a>
                <a href="https://github.com/Arsonist406/Arsonist406.github.io.git" target="_blank" rel="noopener noreferrer">Github</a>
            </div>
            <div className="footer-text">
                <p>Web-project LPNU</p>
            </div>
        </footer>
    );
};

export default Footer;