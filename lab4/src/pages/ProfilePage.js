import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase-config';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        height: '',
        weight: '',
        daily_walk_target: ''
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Завантажуємо додаткові дані користувача
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                    setFormData({
                        username: userDoc.data().username || '',
                        height: userDoc.data().height || '',
                        weight: userDoc.data().weight || '',
                        daily_walk_target: userDoc.data().daily_walk_target
                    });
                }
                setLoading(false);
            } else {
                navigate('/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Помилка при виході:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                username: formData.username,
                height: parseInt(formData.height),
                weight: parseInt(formData.weight),
                daily_walk_target: parseInt(formData.daily_walk_target)
            });
            setUserData({
                ...userData,
                ...formData
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Помилка при оновленні даних:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <div className="loading-spinner">Завантаження...</div>;
    }

    return (
        <div>
            <Header />
            <div className="profile-container">
                <div className="profile-background"></div>

                <div className="profile-main">
                    <div className="profile-card">
                        <div className="profile-header">
                            <img
                                src={user.photoURL || "/resources/image/default-avatar.png"}
                                alt="Profile"
                                className="profile-avatar"
                            />
                            <h2>{userData?.username || user.email}</h2>
                        </div>

                        <div className="profile-info">
                            <div className="info-item">
                                <span>Email:</span>
                                <span>{user.email}</span>
                            </div>

                            {isEditing ? (
                                <>
                                    <div className="info-item">
                                        <span>Ім'я:</span>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="info-item">
                                        <span>Зріст (см):</span>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            min="100"
                                        />
                                    </div>
                                    <div className="info-item">
                                        <span>Вага (кг):</span>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            min="30"
                                        />
                                    </div>
                                    <div className="info-item">
                                        <span>Щоденна ціль кроків:</span>
                                        <input
                                            type="number"
                                            name="daily_walk_target"
                                            value={formData.daily_walk_target}
                                            onChange={handleChange}
                                            min="1000"
                                            max="30000"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="info-item">
                                        <span>Ім'я:</span>
                                        <span>{userData?.username || 'Не вказано'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span>Зріст:</span>
                                        <span>{userData?.height ? `${userData.height} см` : 'Не вказано'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span>Вага:</span>
                                        <span>{userData?.weight ? `${userData.weight} кг` : 'Не вказано'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span>Щоденна ціль кроків:</span>
                                        <span>{userData?.daily_walk_target || 'Не вказано'}</span>
                                    </div>
                                </>
                            )}

                            <div className="info-item">
                                <span>Дата реєстрації:</span>
                                <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button className="save-btn" onClick={handleSave}>
                                        Зберегти
                                    </button>
                                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                        Скасувати
                                    </button>
                                </>
                            ) : (
                                <button className="edit-btn" onClick={handleEdit}>
                                    Редагувати профіль
                                </button>
                            )}
                            <button className="logout-btn" onClick={handleLogout}>
                                Вийти з акаунту
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;