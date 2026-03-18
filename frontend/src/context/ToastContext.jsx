import React, { useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from './ToastContextInstance';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in-up transition-all group hover:-translate-y-1 ${toast.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
              : toast.type === 'error'
                ? 'bg-red-50/90 border-red-100 text-red-800'
                : toast.type === 'warning'
                  ? 'bg-amber-50/90 border-amber-100 text-amber-800'
                  : 'bg-blue-50/90 border-blue-100 text-blue-800'
              }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <p className="font-bold text-sm tracking-tight">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:bg-black/5 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

