import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext';

// Intercept and silence Recharts layout tick width warnings globally
const suppressRechartsWarning = (originalConsole) => {
  return (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('width') &&
      args[0].includes('height') &&
      args[0].includes('should be greater than 0')
    ) {
      return;
    }
    originalConsole(...args);
  };
};

console.warn = suppressRechartsWarning(console.warn);
console.error = suppressRechartsWarning(console.error);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
