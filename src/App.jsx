import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './utils/firebaseConfig';

// Initialize Firebase
initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;