import axios from 'axios';

const API_URL = 'https://prephire-7vlj.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Added timeout to handle Render cold starts
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

// ─── BULLETPROOF FETCH UPLOAD ───
export const uploadResume = async (formData, targetRole) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/upload-resume?target_role=${encodeURIComponent(targetRole)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // 🚨 Notice there is NO Content-Type header here! 
      // The browser will generate the perfect multipart boundary automatically.
    },
    body: formData,
  });

  if (!response.ok) {
    // Replicate Axios error structure so Dashboard.jsx doesn't break
    const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw { response: { data: errorData } }; 
  }

  const data = await response.json();
  return { data };
};

export const changePlan = (userId, plan) => 
  api.put(`/admin/change-plan/${userId}?plan=${plan}`);

export const getMyAnalyses = () => api.get('/my-analyses');
export const getAnalysis = (id) => api.get(`/analyses/${id}`);

export default api;