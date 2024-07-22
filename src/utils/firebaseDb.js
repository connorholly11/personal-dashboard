// src/utils/firebaseDb.js
import { ref, set, get } from 'firebase/database';
import { db } from './firebaseConfig';

export const setData = async (key, value) => {
  try {
    await set(ref(db, key), value);
    console.log(`Data saved successfully for key: ${key}`);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async (key) => {
  try {
    const snapshot = await get(ref(db, key));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log(`No data available for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error);
    throw error;
  }
};