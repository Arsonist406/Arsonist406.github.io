import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {auth, db} from '../firebase-config';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/auth.css';
import {ENDPOINTS} from "../static/static";

const AuthPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [dailyWalkTarget, setDailyWalkTarget] = useState(12000);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const handleNumberInput = (e, setter) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setter(value);
        } else if (e.target.value === '') {
            setter('');
        }
    };

    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
                return 'Електронна пошта або пароль не вірні';
            case 'auth/email-already-in-use':
                return 'Ця електронна пошта вже використовується';
            default:
                return 'Сталася помилка. Будь ласка, спробуйте ще раз';
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();

        if (!isLogin && (height <= 0 || weight <= 0)) {
            setError('Зріст і вага повинні бути більше 0');
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email,
                    username,
                    height: Math.max(1, parseInt(height)),
                    weight: Math.max(1, parseInt(weight)),
                    daily_walk_target: Math.max(1000, parseInt(dailyWalkTarget)),
                    createdAt: new Date(),
                });
                navigate('/');
            }
        } catch (err) {
            setError(getFriendlyErrorMessage(err.code));
        }
    };

    return (
        <div>
            <div className="container">
                <div className="background-image auth-left-image"></div>
                <div className="background-image auth-right-image"></div>

                <div className="auth-center-box">
                    <div className="auth-header">
                        <Link to="/">
                            <img src={ENDPOINTS.STATIC("site-logo.png")} alt="Healthy Life" />
                        </Link>
                    </div>

                    <div className="auth-form-container">
                        <h2>{isLogin ? 'Увійти' : 'Реєстрація'}</h2>
                        {error && (
                            <p className="auth-error" style={{ color: '#f44336', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}
                        <form onSubmit={handleAuth}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {!isLogin && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Ім'я користувача"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Зріст (см)"
                                        value={height}
                                        onChange={(e) => handleNumberInput(e, setHeight)}
                                        min="1"
                                        required
                                    />

                                    <input
                                        type="number"
                                        placeholder="Вага (кг)"
                                        value={weight}
                                        onChange={(e) => handleNumberInput(e, setWeight)}
                                        min="1"
                                        required
                                    />

                                    <div className="input-slider">
                                        <label>Ціль щоденних кроків: {dailyWalkTarget}</label>
                                        <input
                                            type="range"
                                            min="1000"
                                            max="30000"
                                            step="1000"
                                            value={dailyWalkTarget}
                                            onChange={(e) => setDailyWalkTarget(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <button type="submit">
                                {isLogin ? 'Увійти' : 'Зареєструватися'}
                            </button>
                        </form>

                        <p className="auth-toggle">
                            {isLogin ? 'Немає акаунта? ' : 'Вже є акаунт? '}
                            <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Реєстрація' : 'Увійти'}
              </span>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AuthPage;