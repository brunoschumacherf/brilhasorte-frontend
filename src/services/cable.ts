import { createConsumer } from '@rails/actioncable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Converte a URL http/https para ws/wss
const CABLE_URL = API_URL.replace(/^http/, 'ws');

// Adiciona o token de autenticação à URL para que o Action Cable possa autenticar a conexão.
const getCableUrlWithToken = () => {
  const token = localStorage.getItem('token');
  // Remove as aspas extras que o localStorage pode adicionar
  const cleanToken = token ? token.replace(/"/g, '') : '';
  return `${CABLE_URL}/cable?token=${cleanToken}`;
};

const consumer = createConsumer(getCableUrlWithToken);

export default consumer;
