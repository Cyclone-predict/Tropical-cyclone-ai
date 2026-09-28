const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Predict cyclone from satellite image
 * POST /predict
 */
export const predictSatelliteImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in predictSatelliteImage:", error);
    throw error;
  }
};

/**
 * Get list of all cyclones
 * GET /cyclones
 */
export const getCyclones = async () => {
  try {
    const response = await fetch(`${API_URL}/cyclones`);
    if (!response.ok) {
      if (response.status === 404) return []; // Graceful fallback
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCyclones:", error);
    throw error;
  }
};

/**
 * Get specific cyclone details
 * GET /cyclones/{id}
 */
export const getCyclone = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cyclones/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getCyclone for ${id}:`, error);
    throw error;
  }
};

/**
 * Get cyclone history/evolution
 * GET /cyclones/{id}/history
 */
export const getCycloneHistory = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cyclones/${id}/history`);
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getCycloneHistory for ${id}:`, error);
    throw error;
  }
};

/**
 * Get prediction track for cyclone
 * GET /cyclones/{id}/prediction
 */
export const getCyclonePrediction = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cyclones/${id}/prediction`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error in getCyclonePrediction for ${id}:`, error);
    throw error;
  }
};
