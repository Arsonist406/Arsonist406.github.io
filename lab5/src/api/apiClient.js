const API_RENDER_URL = 'https://arsonist406-github-io.onrender.com/api';
// const API_LOCAL_URL = 'http://localhost:5000/api';

export const fetchTrainings = async (userId) => {
    const response = await fetch(`${API_RENDER_URL}/trainings-log/${userId}`);
    if (!response.ok) throw new Error('Не вдалося завантажити тренування');
    return await response.json();
};

export const addTraining = async (userId, trainingData) => {
    const response = await fetch(`${API_RENDER_URL}/trainings-log/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData),
    });
    if (!response.ok) throw new Error('Не вдалося додати тренування');
    return await response.json();
};