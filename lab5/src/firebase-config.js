import {getFirestore} from "firebase/firestore";
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDpHUV_cW-pkhMI45m_7ofzFD-fZjmqN78",
    authDomain: "healty-life-2.firebaseapp.com",
    projectId: "healty-life-2",
    storageBucket: "healty-life-2.firebasestorage.app",
    messagingSenderId: "679196467462",
    appId: "1:679196467462:web:b098f2fd3b38554af83e87"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
