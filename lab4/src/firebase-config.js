
import { getFirestore} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    singInWithEmailAndPassword,
    signOut,
    getIdToken,
} from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAe6oA9QgUFIALbOhDEoY7nd7DcbQ50UCw",
    authDomain: "healthy-life-483f2.firebaseapp.com",
    projectId: "healthy-life-483f2",
    storageBucket: "healthy-life-483f2.firebasestorage.app",
    messagingSenderId: "820351545514",
    appId: "1:820351545514:web:33f2842160d435d79060d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
