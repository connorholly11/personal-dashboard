// Helper functions
const getItem = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`${key} saved:`, value);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    throw error;
  }
};

// Habit Tracker functions
export function getHabits() {
  const habits = getItem('habits') || [];
  console.log('Habits fetched:', habits);
  return habits;
}

export function setHabits(habits) {
  setItem('habits', habits);
}

// Notes functions
export function getNotes() {
  const notes = localStorage.getItem('notes') || "";
  console.log('Notes fetched:', notes);
  return notes;
}

export function setNotes(notes) {
  try {
    localStorage.setItem('notes', notes);
    console.log('Notes saved:', notes);
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
}

// Health Fitness functions
export function getWorkouts() {
  const workouts = getItem('workouts') || [];
  console.log('Workouts fetched:', workouts);
  return workouts;
}

export function setWorkouts(workouts) {
  setItem('workouts', workouts);
}

// Version control
export function saveLastVersion() {
  const lastVersion = {
    habits: getHabits(),
    notes: getNotes(),
    workouts: getWorkouts(),
  };
  setItem('lastVersion', lastVersion);
}

export function restoreLastVersion() {
  const lastVersion = getItem('lastVersion');
  if (lastVersion) {
    setHabits(lastVersion.habits);
    setNotes(lastVersion.notes);
    setWorkouts(lastVersion.workouts);
    return true;
  }
  return false;
}

// Export functions
export function exportData(section = 'all') {
  const data = {};
  if (section === 'all' || section === 'habits') {
    data.habits = getHabits();
  }
  if (section === 'all' || section === 'notes') {
    data.notes = getNotes();
  }
  if (section === 'all' || section === 'fitness') {
    data.workouts = getWorkouts();
  }
  return JSON.stringify(data);
}

// Import functions
export function importData(jsonData, section = 'all') {
  saveLastVersion(); // Save current state before import
  try {
    const data = JSON.parse(jsonData);
    if (section === 'all' || section === 'habits') {
      if (data.habits) setHabits(data.habits);
    }
    if (section === 'all' || section === 'notes') {
      if (data.notes) setNotes(data.notes);
    }
    if (section === 'all' || section === 'fitness') {
      if (data.workouts) setWorkouts(data.workouts);
    }
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}