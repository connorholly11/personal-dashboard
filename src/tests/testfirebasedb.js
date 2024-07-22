// src/tests/testFirebaseDb.js
import { setData, getData } from '../utils/firebaseDb.js';

const testFirebaseDb = async () => {
  try {
    // Test setting data
    await setData('testKey', { message: 'Hello, Firebase!' });
    console.log('Data set successfully');

    // Test getting data
    const data = await getData('testKey');
    console.log('Retrieved data:', data);

    if (data && data.message === 'Hello, Firebase!') {
      console.log('Firebase key/value pairs are working correctly!');
    } else {
      console.log('There might be an issue with Firebase key/value pairs');
    }
  } catch (error) {
    console.error('Error during Firebase test:', error);
  }
};

testFirebaseDb();