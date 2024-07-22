// src/utils/firebaseDb.js
import { ref, set, get, onValue, off } from 'firebase/database';
import { db } from './firebaseConfig.js'; // Added .js extension

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

export const exportData = async () => {
  // Implementation needed
};

export const importData = async () => {
  // Implementation needed
};

export const restoreLastVersion = async () => {
  // Implementation needed
};

export const getHabits = async () => {
  return getData('habits') || [];
};

export const setHabits = async (habits) => {
  return setData('habits', habits);
};

export const getNotes = async () => {
  return getData('notes') || [];
};

export const setNotes = async (notes) => {
  return setData('notes', notes);
};

export const subscribeToHabits = (callback) => {
  const habitsRef = ref(db, 'habits');
  const unsubscribe = onValue(habitsRef, (snapshot) => {
    const data = snapshot.val() || [];
    callback(data);
  });

  return unsubscribe;
};

export const getWorkouts = async () => {
  return getData('workouts') || [];
};

export const setWorkouts = async (workouts) => {
  return setData('workouts', workouts);
};

export const subscribeToWorkouts = (callback) => {
  const workoutsRef = ref(db, 'workouts');
  const unsubscribe = onValue(workoutsRef, (snapshot) => {
    const data = snapshot.val() || [];
    callback(data);
  });

  return unsubscribe;
};
