import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZuog7tsOou6oGIEznYBhpK90b7O4fmqo",
    authDomain: "filemanagerss.firebaseapp.com",
    projectId: "filemanagerss",
    storageBucket: "filemanagerss.appspot.com",
    messagingSenderId: "1069829294314",
    appId: "1:1069829294314:web:bd7ff860ba895dca036f93",
    measurementId: "G-WNSB1QN3B7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Register with Firebase
export const registerWithFirebase = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        return { user: userCredential.user, token };
    } catch (error) {
        throw error;
    }
};

// Login with Firebase
export const loginWithFirebase = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        return { user: userCredential.user, token };
    } catch (error) {
        throw error;
    }
};

// Logout from Firebase
export const logoutFromFirebase = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

export { auth }; 