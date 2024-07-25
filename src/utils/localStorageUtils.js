/**
 * Utility functions for local storage operations
 */

/**
 * Save data to local storage
 * @param {string} key - The key under which the data will be stored
 * @param {any} data - The data to be stored
 */
export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Retrieve data from local storage
 * @param {string} key - The key under which the data is stored
 * @returns {any} - The retrieved data
 */
export const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Delete data from local storage
 * @param {string} key - The key under which the data is stored
 */
export const deleteFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

/**
 * Export data from local storage
 * @param {string} key - The key under which the data is stored
 * @returns {Blob} - The exported data as a Blob
 */
export const exportLocalData = (key) => {
  const data = getFromLocalStorage(key) || [];
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
};

/**
 * Import data to local storage
 * @param {string} key - The key under which the data will be stored
 * @param {File} file - The file containing the data to be imported
 * @returns {Promise<void>} - A promise that resolves when the data is imported
 */
export const importLocalData = (key, file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        saveToLocalStorage(key, importedData);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};
