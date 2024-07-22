// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCcsr2bkh8UZvtRG9klVufcTErGWoTk0WE",
  authDomain: "personal-dashboard-80620.firebaseapp.com",
  databaseURL: "https://personal-dashboard-80620-default-rtdb.firebaseio.com",
  projectId: "personal-dashboard-80620",
  storageBucket: "personal-dashboard-80620.appspot.com",
  messagingSenderId: "7558902555",
  appId: "1:7558902555:web:b7e722a970bd128369d9be",
  measurementId: "G-RRFKY40W7S"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
