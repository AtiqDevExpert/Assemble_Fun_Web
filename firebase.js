// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyA4Cysdi0IQEd9HgYtByH_pcsz4Ywfs6JU",
    authDomain: "assemble-408917.firebaseapp.com",
    projectId: "assemble-408917",
    storageBucket: "assemble-408917.appspot.com",
    messagingSenderId: "153444834280",
    appId: "1:153444834280:web:7c6b1555e17ae400a3625d",
    measurementId: "G-JJ8W0FCSQ7"
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
