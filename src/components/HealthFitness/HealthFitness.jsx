import React, { useState, useEffect } from 'react';
import './HealthFitness.css';
import { getWorkouts, setWorkouts, subscribeToWorkouts, exportData, importData } from '../../utils/firebaseDb.js';

function HealthFitness() {
  const [workouts, setWorkoutsState] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToWorkouts((updatedWorkouts) => {
      setWorkoutsState(updatedWorkouts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      saveWorkouts();
    }
  }, [workouts]);

  const fetchWorkouts = async () => {
    try {
      const savedWorkouts = await getWorkouts();
      setWorkoutsState(savedWorkouts);
    } catch (error) {
      setError('Error fetching workouts: ' + error.message);
    }
  };

  const saveWorkouts = async () => {
    try {
      await setWorkouts(workouts);
    } catch (error) {
      setError('Error saving workouts: ' + error.message);
    }
  };

  const startWorkout = () => {
    const defaultName = `Workout ${new Date().toLocaleString()}`;
    setWorkoutName(defaultName);
    setCurrentWorkout({
      id: Date.now(),
      name: defaultName,
      date: new Date().toISOString(),
      exercises: []
    });
  };

  const updateWorkoutName = (name) => {
    setWorkoutName(name);
    setCurrentWorkout(prev => ({ ...prev, name }));
  };

  const addExercise = () => {
    if (exerciseName.trim() === '') return;
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { id: Date.now(), name: exerciseName, sets: [] }
      ]
    }));
    setExerciseName('');
  };

  const addSet = (exerciseId) => {
    if (reps === '' || weight === '') return;
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => 
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, { reps: parseInt(reps), weight: parseFloat(weight) }] }
          : exercise
      )
    }));
    setReps('');
    setWeight('');
  };

  const finishWorkout = async () => {
    try {
      const updatedWorkouts = [...workouts, currentWorkout];
      await setWorkouts(updatedWorkouts);
      setWorkoutsState(updatedWorkouts);
      setCurrentWorkout(null);
      setWorkoutName('');
    } catch (error) {
      setError('Error finishing workout: ' + error.message);
    }
  };

  const startEditingWorkout = (workout) => {
    setEditingWorkout({ ...workout });
  };

  const updateEditingWorkout = (field, value) => {
    setEditingWorkout(prev => ({ ...prev, [field]: value }));
  };

  const updateExerciseInEditingWorkout = (exerciseId, field, value) => {
    setEditingWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const updateSetInEditingWorkout = (exerciseId, setIndex, field, value) => {
    setEditingWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set, idx) =>
                idx === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    }));
  };

  const saveEditingWorkout = async () => {
    try {
      const updatedWorkouts = workouts.map(w => w.id === editingWorkout.id ? editingWorkout : w);
      await setWorkouts(updatedWorkouts);
      setEditingWorkout(null);
    } catch (error) {
      setError('Error saving edited workout: ' + error.message);
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      await setWorkouts(updatedWorkouts);
      setWorkoutsState(updatedWorkouts);
    } catch (error) {
      setError('Error deleting workout: ' + error.message);
    }
  };

  const handleExport = async () => {
    try {
      const dataToExport = await exportData('fitness');
      const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fitness-tracker-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Error exporting data: ' + error.message);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          await importData(importedData, 'fitness');
          fetchWorkouts(); // Refresh the data after import
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
    <div className="health-fitness">
      <h1>Fitness Tracker</h1>

      {!currentWorkout ? (
        <div className="start-workout">
          <button onClick={startWorkout}>Start New Workout</button>
        </div>
      ) : (
        <div className="current-workout">
          <input
            type="text"
            value={workoutName}
            onChange={(e) => updateWorkoutName(e.target.value)}
            placeholder="Workout Name"
            className="workout-name-input"
          />
          <div className="add-exercise">
            <input 
              type="text" 
              value={exerciseName} 
              onChange={(e) => setExerciseName(e.target.value)} 
              placeholder="Exercise name"
            />
            <button onClick={addExercise}>Add Exercise</button>
          </div>

          {currentWorkout.exercises.map((exercise) => (
            <div key={exercise.id} className="exercise">
              <h3>{exercise.name}</h3>
              <div className="sets">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="set">
                    Set {setIndex + 1}: {set.reps} reps @ {set.weight} lbs
                  </div>
                ))}
              </div>
              <div className="add-set">
                <input 
                  type="number" 
                  value={reps} 
                  onChange={(e) => setReps(e.target.value)} 
                  placeholder="Reps"
                />
                <input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Weight (lbs)"
                />
                <button onClick={() => addSet(exercise.id)}>Add Set</button>
              </div>
            </div>
          ))}

          <button onClick={finishWorkout} className="finish-workout">Finish Workout</button>
        </div>
      )}

      <div className="workout-history">
        <h2>Workout History</h2>
        {workouts.map((workout) => (
          <div key={workout.id} className="workout-entry">
            {editingWorkout && editingWorkout.id === workout.id ? (
              <div className="edit-workout">
                <input
                  type="text"
                  value={editingWorkout.name}
                  onChange={(e) => updateEditingWorkout('name', e.target.value)}
                />
                {editingWorkout.exercises.map((exercise) => (
                  <div key={exercise.id} className="edit-exercise">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExerciseInEditingWorkout(exercise.id, 'name', e.target.value)}
                    />
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="edit-set">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSetInEditingWorkout(exercise.id, setIndex, 'reps', parseInt(e.target.value))}
                        />
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSetInEditingWorkout(exercise.id, setIndex, 'weight', parseFloat(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <button onClick={saveEditingWorkout}>Save Changes</button>
                <button onClick={() => setEditingWorkout(null)}>Cancel</button>
              </div>
            ) : (
              <div className="workout-header">
                <h3>{workout.name} - {new Date(workout.date).toLocaleDateString()}</h3>
                <div>
                  <button onClick={() => startEditingWorkout(workout)} className="edit-button">Edit</button>
                  <button onClick={() => deleteWorkout(workout.id)} className="delete-button">Delete</button>
                </div>
              </div>
            )}
            {!editingWorkout && workout.exercises.map((exercise) => (
              <div key={exercise.id} className="exercise-entry">
                <h4>{exercise.name}</h4>
                <ul>
                  {exercise.sets.map((set, setIndex) => (
                    <li key={setIndex}>Set {setIndex + 1}: {set.reps} reps @ {set.weight} lbs</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

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
    </div>
  );
}

export default HealthFitness;
