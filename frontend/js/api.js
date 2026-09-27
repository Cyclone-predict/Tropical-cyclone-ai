/**
 * CycloneAI Labs — API Service Layer
 * Handles all communication with the backend API.
 * Does NOT hard-code any fake data.
 */

const CycloneAPI = (function () {
  // Default API base URL — configurable via UI
  let BASE_URL = localStorage.getItem('cycloneai_api_url') || 'http://localhost:8000';

  /**
   * Get the current API base URL
   */
  function getBaseUrl() {
    return BASE_URL;
  }

  /**
   * Set a new API base URL
   */
  function setBaseUrl(url) {
    BASE_URL = url.replace(/\/+$/, ''); // Remove trailing slash
    localStorage.setItem('cycloneai_api_url', BASE_URL);
  }

  /**
   * Check if the backend is reachable
   * @returns {Promise<boolean>}
   */
  async function healthCheck() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(BASE_URL + '/', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeout);
      return response.ok;
    } catch (err) {
      return false;
    }
  }

  /**
   * Predict cyclone from satellite image
   * POST /predict
   * @param {File} file - The satellite image file
   * @returns {Promise<Object>} Inference result JSON
   */
  async function predictSatelliteImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(BASE_URL + '/predict', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        'API Error ' + response.status + ': ' +
        (errorText || response.statusText || 'Unknown error')
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get list of all cyclones
   * GET /cyclones
   * @returns {Promise<Array>}
   */
  async function getCyclones() {
    const response = await fetch(BASE_URL + '/cyclones');

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error('API Error ' + response.status);
    }

    return await response.json();
  }

  /**
   * Get specific cyclone details
   * GET /cyclones/{id}
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async function getCyclone(id) {
    const response = await fetch(BASE_URL + '/cyclones/' + encodeURIComponent(id));

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('API Error ' + response.status);
    }

    return await response.json();
  }

  /**
   * Get cyclone history/evolution
   * GET /cyclones/{id}/history
   * @param {string} id
   * @returns {Promise<Array>}
   */
  async function getCycloneHistory(id) {
    const response = await fetch(BASE_URL + '/cyclones/' + encodeURIComponent(id) + '/history');

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error('API Error ' + response.status);
    }

    return await response.json();
  }

  /**
   * Get prediction track for cyclone
   * GET /cyclones/{id}/prediction
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async function getCyclonePrediction(id) {
    const response = await fetch(BASE_URL + '/cyclones/' + encodeURIComponent(id) + '/prediction');

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('API Error ' + response.status);
    }

    return await response.json();
  }

  // Public API
  return {
    getBaseUrl: getBaseUrl,
    setBaseUrl: setBaseUrl,
    healthCheck: healthCheck,
    predictSatelliteImage: predictSatelliteImage,
    getCyclones: getCyclones,
    getCyclone: getCyclone,
    getCycloneHistory: getCycloneHistory,
    getCyclonePrediction: getCyclonePrediction
  };
})();
