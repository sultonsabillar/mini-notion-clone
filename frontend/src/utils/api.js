import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // agar cookie JWT otomatis dikirim
});

export default api; 