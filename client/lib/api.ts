import axios from 'axios';
import Cookies from 'js-cookie';

// Detecta automaticamente a URL da API baseado no ambiente
const getApiUrl = () => {
  // Se já tem a variável configurada, usa ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Em produção, usa a URL de produção
  if (process.env.NODE_ENV === 'production') {
    return 'https://gatto-ten.vercel.app/api';
  }
  
  // Em desenvolvimento, usa localhost
  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
