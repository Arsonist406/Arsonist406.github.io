import React, {useState} from 'react';
import {db} from '../firebase-config';
import {addDoc, collection} from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import {getAuth} from 'firebase/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/main.css';
import '../styles/create-training.css';
import {ENDPOINTS} from "../static/static";

const CreateTrainingPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        videoId: '',
        previewImage: '',
        complexity: 'Низька',
        category: 'Загальне',
        content: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("Користувач не авторизований.");
                return;
            }

            const cleanedPreviewImage = formData.previewImage.replace(/-blur\d*(?=\.\w+$)/, '');

            const newTraining = {
                ...formData,
                previewImage: cleanedPreviewImage
            };

            const userId = user.uid;
            await addDoc(collection(db, 'users', userId, 'trainings'), newTraining);

            alert('Тренування успішно створено!');
            navigate('/training-programs');
        } catch (error) {
            console.error('Помилка при створенні тренування:', error);
            alert('Сталася помилка при створенні тренування');
        }
    };

    return (
        <div>
            <div className="container">
                <div className="background-image training-left-image"></div>
                <div className="background-image training-right-image"></div>

                <div className="training-center-box1">
                    <Header />

                    <div className="create-training-container1">
                        <h1>Створити нове тренування</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Назва:</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Короткий опис:</label>
                                <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>ID відео з YouTube (без "https://youtu.be/"):</label>
                                <input type="text" name="videoId" value={formData.videoId} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label>Прев'ю:</label>
                                <div className="image-selection">
                                    {['cardio-preview-blur2.png',
                                        'functional-preview-blur4.png',
                                        'home-preview-blur8.png',
                                        'strength-preview-blur6.jpg',
                                        'stretching-preview-blur3.png',
                                        'yoga-preview-blur3.png'
                                    ].map((imgName) => {
                                        return (
                                        <img
                                            key={imgName}
                                            src={ENDPOINTS.STATIC(`exercises/preview/${imgName}`)}
                                            alt={imgName}
                                            className={`selectable-image ${formData.previewImage === imgName ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, previewImage: imgName }))}
                                        />
                                        );
                                    })}
                                </div>
                            </div>


                            <div className="form-group">
                                <label>Складність:</label>
                                <select name="complexity" value={formData.complexity} onChange={handleChange}>
                                    <option value="Низька">Низька</option>
                                    <option value="Середня">Середня</option>
                                    <option value="Висока">Висока</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Категорія:</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="Силове">Силове</option>
                                    <option value="Кардіо">Кардіо</option>
                                    <option value="Йога">Йога</option>
                                    <option value="Загальне">Загальне</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Контент (HTML):</label>
                                <textarea name="content" value={formData.content} onChange={handleChange} required />
                            </div>

                            <div className="form-group button-group">
                                <button type="submit" className="submit-button">Створити тренування</button>
                            </div>
                        </form>
                    </div>

                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default CreateTrainingPage;
