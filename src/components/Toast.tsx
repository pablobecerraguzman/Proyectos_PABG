import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={`pointer-events-auto flex items-start p-4 rounded-xl border shadow-xl backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-800/60 text-red-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-800/60 text-amber-100'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800/60 text-emerald-100'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 pr-2">
              <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs opacity-85 mt-1 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              id={`dismiss-toast-${toast.id}`}
              onClick={() => onDismiss(toast.id)}
              className="opacity-70 hover:opacity-100 p-1 rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
