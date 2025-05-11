const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/';

export const ENDPOINTS = {
    TRAININGS_LOG: (userId) => `${BASE_URL}api/trainings-log/${userId}`,
    STATIC: (path) => `${BASE_URL}resources/image/${path}`,
};