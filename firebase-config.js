// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgQZ7vYtjmhB93PXfOSD0_TO2rMzDbJ_M",
    authDomain: "skladweb-a68f6.firebaseapp.com",
    projectId: "skladweb-a68f6",
    storageBucket: "skladweb-a68f6.firebasestorage.app",
    messagingSenderId: "937123326404",
    appId: "1:937123326404:web:3bd6e8de6e8cbce2339c91"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
