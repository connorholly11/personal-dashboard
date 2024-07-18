import React, { useState, useEffect } from 'react';
import './HabitTracker.css';
import { getHabits, setHabits, getNotes, setNotes, exportData, importData } from '../../utils/db.js';

function HabitTracker() {
  const [habits, setHabitsState] = useState([]);
  const [archivedHabits, setArchivedHabitsState] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitStartDate, setNewHabitStartDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);
  const [notes, setNotesState] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveData();
  }, [habits, archivedHabits, notes]);

  const fetchData = () => {
    try {
      const habitsData = getHabits();
      setHabitsState(habitsData.filter(habit => !habit.archived));
      setArchivedHabitsState(habitsData.filter(habit => habit.archived));
      const notesData = getNotes();
      setNotesState(notesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
  };

  const saveData = () => {
    try {
      setHabits([...habits, ...archivedHabits]);
      setNotes(notes);
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message);
    }
  };

  const calculateStreak = (startDate, checkIns) => {
    const now = currentTime;
    const start = new Date(startDate);
    const diffTime = Math.abs(now - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffTime % (1000 * 60)) / 1000);

    return { days: diffDays, hours: diffHours, minutes: diffMinutes, seconds: diffSeconds };
  };

  const resetCounter = () => {
    if (selectedHabit) {
      const now = new Date();
      const updatedHabits = habits.map(habit =>
        habit.id === selectedHabit.id
          ? {
              ...habit,
              startDate: now,
              checkIns: []
            }
          : habit
      );
      setHabitsState(updatedHabits);
      setSelectedHabit({...selectedHabit, startDate: now, checkIns: []});
      setShowResetConfirm(false);
    }
  };

  const addNewHabit = () => {
    if (newHabitName.trim() !== '') {
      const startDate = newHabitStartDate
        ? new Date(`${newHabitStartDate}T00:01:00`)
        : new Date();
      const newHabit = {
        id: Date.now(),
        name: newHabitName,
        startDate: startDate,
        checkIns: [],
        archived: false
      };
      setHabitsState(prevHabits => [...prevHabits, newHabit]);
      setNewHabitName('');
      setNewHabitStartDate('');
    }
  };

  const deleteHabit = () => {
    if (selectedHabit) {
      setHabitsState(prevHabits => prevHabits.filter(habit => habit.id !== selectedHabit.id));
      setSelectedHabit(null);
      setShowDeleteConfirm(false);
    }
  };

  const archiveHabit = () => {
    if (selectedHabit) {
      const archivedHabit = {...selectedHabit, archived: true};
      setArchivedHabitsState(prevArchived => [...prevArchived, archivedHabit]);
      setHabitsState(prevHabits => prevHabits.filter(habit => habit.id !== selectedHabit.id));
      setSelectedHabit(null);
      setShowArchiveConfirm(false);
    }
  };

  const unarchiveHabit = (habit) => {
    const unarchivedHabit = {...habit, archived: false};
    setHabitsState(prevHabits => [...prevHabits, unarchivedHabit]);
    setArchivedHabitsState(prevArchived => prevArchived.filter(h => h.id !== habit.id));
  };

  const checkIn = (date) => {
    if (selectedHabit) {
      const checkInDate = new Date(date).setHours(0, 0, 0, 0);
      const updatedHabits = habits.map(habit =>
        habit.id === selectedHabit.id
          ? {
              ...habit,
              checkIns: habit.checkIns.some(d => new Date(d).setHours(0, 0, 0, 0) === checkInDate)
                ? habit.checkIns.filter(d => new Date(d).setHours(0, 0, 0, 0) !== checkInDate)
                : [...habit.checkIns, new Date(checkInDate)]
            }
          : habit
      );
      setHabitsState(updatedHabits);
      setSelectedHabit(updatedHabits.find(h => h.id === selectedHabit.id));
    }
  };

  const getLast3Days = () => {
    const today = new Date();
    return [
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      today
    ];
  };

  const isCheckedIn = (date) => {
    if (!selectedHabit) return false;
    return selectedHabit.checkIns.some(checkIn => 
      new Date(checkIn).setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0)
    );
  };
  const handleExport = () => {
    const dataToExport = exportData('habits'); // Export only habits data
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-tracker-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importData(e.target.result, 'habits'); // Import only habits data
          fetchData(); // Refresh the data after import
        } catch (error) {
          setError('Error importing data: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="HabitTracker">
      <header>
        <h1>Habit Tracker</h1>
      </header>
      <main>
        {selectedHabit ? (
          <div className="habit-dashboard">
            <h2 className="habit-name">{selectedHabit.name}</h2>
            <div className="streak-display">
              <h3>Current Streak</h3>
              <div className="streak-numbers">
                {Object.entries(calculateStreak(selectedHabit.startDate, selectedHabit.checkIns)).map(([unit, value]) => (
                  <div key={unit} className="streak-unit">
                    <span className="value">{value}</span>
                    <span className="unit">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="check-in-section">
              <h3>Check-ins</h3>
              <div className="check-in-days">
                {getLast3Days().map((day, index) => (
                  <div key={index} className="check-in-day">
                    <span className="day-label">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <div 
                      onClick={() => checkIn(day)}
                      className={`check-in-circle ${isCheckedIn(day) ? 'checked-in' : ''}`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="habit-actions">
              {showResetConfirm ? (
                <div className="confirm-dialog">
                  <p>Are you sure you want to reset the streak?</p>
                  <button onClick={resetCounter} className="confirm-button">Yes, Reset</button>
                  <button onClick={() => setShowResetConfirm(false)} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowResetConfirm(true)} className="action-button">Reset Streak</button>
              )}
              {showArchiveConfirm ? (
                <div className="confirm-dialog">
                  <p>Are you sure you want to archive this habit?</p>
                  <button onClick={archiveHabit} className="confirm-button">Yes, Archive</button>
                  <button onClick={() => setShowArchiveConfirm(false)} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowArchiveConfirm(true)} className="action-button">Archive Habit</button>
              )}
              {showDeleteConfirm ? (
                <div className="confirm-dialog">
                  <p>Are you sure you want to delete this habit? This action cannot be undone.</p>
                  <button onClick={deleteHabit} className="confirm-button">Yes, Delete</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} className="action-button delete-button">Delete Habit</button>
              )}
            </div>
          </div>
        ) : (
          <p>Select a habit to get started</p>
        )}
      </main>
      <footer>
        <div className="habit-list">
          <h3>Active Habits</h3>
          {habits.map(habit => (
            <div
              key={habit.id}
              className={`habit-item ${selectedHabit && selectedHabit.id === habit.id ? 'selected' : ''}`}
              onClick={() => setSelectedHabit(habit)}
            >
              <span className="habit-name">{habit.name}</span>
            </div>
          ))}
        </div>
        <div className="add-habit">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New habit name"
          />
          <input
            type="date"
            value={newHabitStartDate}
            onChange={(e) => setNewHabitStartDate(e.target.value)}
          />
          <button onClick={addNewHabit}>Add Habit</button>
        </div>
        <button onClick={() => setShowArchivedHabits(!showArchivedHabits)} className="toggle-button">
          {showArchivedHabits ? 'Hide Archived Habits' : 'Show Archived Habits'}
        </button>
        {showArchivedHabits && (
          <div className="archived-habits">
            <h3>Archived Habits</h3>
            {archivedHabits.map(habit => (
              <div key={habit.id} className="archived-habit-item">
                <span className="habit-name">{habit.name}</span>
                <button onClick={() => unarchiveHabit(habit)} className="unarchive-button">Unarchive</button>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowNotes(!showNotes)} className="toggle-button">
          {showNotes ? 'Hide Notes' : 'Show Notes'}
        </button>
        {showNotes && (
          <div className="notes-section">
            <textarea
              value={notes}
              onChange={(e) => setNotesState(e.target.value)}
              placeholder="Enter your notes here..."
              rows="10"
            ></textarea>
          </div>
        )}
        <div className="import-export">
          <button onClick={handleExport}>Export Data</button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-input"
          />
          <label htmlFor="import-input" className="import-button">Import Data</label>
        </div>
      </footer>
    </div>
  );
}

export default HabitTracker;