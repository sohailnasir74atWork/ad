import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBrzgTjR07zJbznbKcVPbrDqvW_AyrF8i4",
    authDomain: "airdrop---gqr.firebaseapp.com",
    projectId: "airdrop---gqr",
    storageBucket: "airdrop---gqr.appspot.com",
    messagingSenderId: "865075705736",
    appId: "1:865075705736:web:c6dbd70619be0fa80d6c3d"};


// Initialize services
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, database, provider };