// src/utils/db.js

// Habit Tracker functions
export async function getHabits() {
  try {
    const habits = JSON.parse(localStorage.getItem('habits')) || [];
    console.log('Habits fetched:', habits);
    return habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
}

export async function setHabits(habits) {
  try {
    localStorage.setItem('habits', JSON.stringify(habits));
    console.log('Habits saved:', habits);
  } catch (error) {
    console.error('Error saving habits:', error);
    throw error;
  }
}

// Notes functions
export async function getNotes() {
  try {
    const notes = localStorage.getItem('notes') || "";
    console.log('Notes fetched:', notes);
    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return "";
  }
}

export async function setNotes(notes) {
  try {
    localStorage.setItem('notes', notes);
    console.log('Notes saved:', notes);
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
}

// Health Fitness functions
export async function getWorkouts() {
  try {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    console.log('Workouts fetched:', workouts);
    return workouts;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
}

export async function setWorkouts(workouts) {
  try {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    console.log('Workouts saved:', workouts);
  } catch (error) {
    console.error('Error saving workouts:', error);
    throw error;
  }
}

// Version control
export async function saveLastVersion() {
  try {
    const lastVersion = {
      habits: await getHabits(),
      notes: await getNotes(),
      workouts: await getWorkouts(),
    };
    localStorage.setItem('lastVersion', JSON.stringify(lastVersion));
    console.log('Last version saved:', lastVersion);
  } catch (error) {
    console.error('Error saving last version:', error);
    throw error;
  }
}

export async function restoreLastVersion() {
  try {
    const lastVersion = JSON.parse(localStorage.getItem('lastVersion'));
    if (lastVersion) {
      await setHabits(lastVersion.habits);
      await setNotes(lastVersion.notes);
      await setWorkouts(lastVersion.workouts);
      console.log('Last version restored');
      return true;
    }
    console.log('No last version available');
    return false;
  } catch (error) {
    console.error('Error restoring last version:', error);
    return false;
  }
}

// Export functions
export async function exportData(section = 'all') {
  try {
    const data = {};
    if (section === 'all' || section === 'habits') {
      data.habits = await getHabits();
    }
    if (section === 'all' || section === 'notes') {
      data.notes = await getNotes();
    }
    if (section === 'all' || section === 'fitness') {
      data.workouts = await getWorkouts();
    }
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// Import functions
export async function importData(jsonData, section = 'all') {
  try {
    await saveLastVersion(); // Save current state before import
    const data = JSON.parse(jsonData);
    if (section === 'all' || section === 'habits') {
      if (data.habits) await setHabits(data.habits);
    }
    if (section === 'all' || section === 'notes') {
      if (data.notes) await setNotes(data.notes);
    }
    if (section === 'all' || section === 'fitness') {
      if (data.workouts) await setWorkouts(data.workouts);
    }
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
}
