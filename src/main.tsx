import { NotificationsProvider } from './context/NotificationsContext';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <NotificationsProvider><App /></NotificationsProvider>
  </StrictMode>,
);
