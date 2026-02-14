import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

// Request interceptor - log all requests
API.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.data || {});
    return config;
  },
  (error) => {
    console.error('[API] Request failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - log all responses
API.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.method.toUpperCase()} ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      error: error.response?.data || error.message
    });
    return Promise.reject(error);
  }
);

// User Authentication
export const authAPI = {
  signup: (username, password) => API.post('/user/signup', { username, password }),
  login: (username, password) => API.post('/user/login', { username, password }),
  logout: () => API.post('/user/logout'),
};

// Todos
export const todoAPI = {
  getAll: () => API.get('/todo/getAll'),
  add: (title) => API.post('/todo/new', { title, isMarked: false }),
  update: (todoId, title, isMarked) => API.put('/todo/update', { todoId, title, isMarked }),
  delete: (todoId) => API.delete('/todo/remove', { data: { todoId } }),
};

// Notes
export const notesAPI = {
  getAll: () => API.get('/note/getAll'),
  add: (title, description) => API.post('/note/new', { title, description }),
  update: (noteId, title, description) => API.put('/note/update', { noteId, title, description }),
  delete: (noteId) => API.delete('/note/remove', { data: { noteId } }),
};

// URLs
export const urlAPI = {
  getAll: () => API.get('/url/getAll'),
  shorten: (originalUrl) => API.post('/url/new', { originalUrl }),
  remove: (shortUrl) => API.delete('/url/remove', { data: { shortUrl } }),
};

// Tools
export const toolsAPI = {
  generatePassword: (config) => API.post('/tools/password/generate', config),
  convertUnits: (value, fromUnit, toUnit, conversionType) => 
    API.post('/tools/converter/convert', { value, fromUnit, toUnit, conversionType }),
  updateWeatherCity: (city) => API.post('/tools/weather/city', { city }),
  getActivityHistory: (limit = 10) => API.get(`/tools/activity/history?limit=${limit}`),
  getRecentlyUsedTools: (limit = 5) => API.get(`/tools/dashboard/recent-tools?limit=${limit}`),
  getAnalytics: () => API.get('/tools/analytics'),
  getPreferences: () => API.get('/tools/preferences'),
  updatePreferences: (prefs) => API.put('/tools/preferences', prefs),
  getLastNote: () => API.get('/tools/note/last'),
  updateLastNote: (noteId) => API.put('/tools/note/last', { noteId }),
};

export default API;
