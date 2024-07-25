import React, { useState } from 'react';
import HabitTracker from '../HabitTracker/HabitTracker';
import HealthFitness from '../HealthFitness/HealthFitness';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('habits');
  const [exportSection, setExportSection] = useState('all');
  const [importSection, setImportSection] = useState('all');

  const handleExport = async () => {
    try {
      let dataToExport;
      if (exportSection === 'all') {
        dataToExport = {
          habits: JSON.parse(localStorage.getItem('habits') || '[]'),
          workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
          notes: localStorage.getItem('notes') || ''
        };
      } else {
        dataToExport = JSON.parse(localStorage.getItem(exportSection) || '[]');
      }
      const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${exportSection}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error exporting data: ' + error.message);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importSection === 'all') {
            Object.keys(importedData).forEach(key => {
              localStorage.setItem(key, JSON.stringify(importedData[key]));
            });
          } else {
            localStorage.setItem(importSection, JSON.stringify(importedData));
          }
          alert('Data imported successfully. Refresh the page to see changes.');
        } catch (error) {
          alert('Error importing data: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUndoImport = async () => {
    try {
      const lastVersion = localStorage.getItem('lastVersion');
      if (lastVersion) {
        const data = JSON.parse(lastVersion);
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        alert('Reverted to the last version before import. Refresh the page to see changes.');
      } else {
        alert('No previous version available.');
      }
    } catch (error) {
      alert('Error reverting to last version: ' + error.message);
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button
          className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          Habit Tracker
        </button>
        <button
          className={`tab-button ${activeTab === 'fitness' ? 'active' : ''}`}
          onClick={() => setActiveTab('fitness')}
        >
          Health/Fitness
        </button>
      </nav>
      <main className="dashboard-content">
        {activeTab === 'habits' ? <HabitTracker /> : <HealthFitness />}
      </main>
      <div className="dashboard-actions">
        <div>
          <select value={exportSection} onChange={(e) => setExportSection(e.target.value)}>
            <option value="all">All Data</option>
            <option value="habits">Habits Only</option>
            <option value="workouts">Fitness Only</option>
          </select>
          <button onClick={handleExport}>Export</button>
        </div>
        <div>
          <select value={importSection} onChange={(e) => setImportSection(e.target.value)}>
            <option value="all">All Data</option>
            <option value="habits">Habits Only</option>
            <option value="workouts">Fitness Only</option>
          </select>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-input"
          />
          <label htmlFor="import-input" className="import-button">Import</label>
        </div>
        <button onClick={handleUndoImport}>Undo Last Import</button>
      </div>
    </div>
  );
}

export default Dashboard;
