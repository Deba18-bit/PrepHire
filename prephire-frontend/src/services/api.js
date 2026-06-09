import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => api.post('/signup', data);
export const login = (data) => api.post('/login', data);
export const getMe = () => api.get('/me');

// Resume
export const uploadResume = (formData, targetRole) => 
  api.post(`/upload-resume?target_role=${targetRole}`, formData);

export const changePlan = (userId, plan) => 
  api.put(`/admin/change-plan/${userId}?plan=${plan}`);

export const getMyAnalyses = () => api.get('/my-analyses');
export const getAnalysis = (id) => api.get(`/analyses/${id}`);

export default api;