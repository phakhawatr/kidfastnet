import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type, duration = 4000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-sm`}>
        <span className="text-lg">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="flex-1">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast Manager
export class ToastManager {
  private static toasts: Array<{ id: string; props: Omit<ToastProps, 'onClose'> }> = [];
  private static listeners: Array<(toasts: Array<{ id: string; props: Omit<ToastProps, 'onClose'> }>) => void> = [];

  static show(props: Omit<ToastProps, 'onClose'>) {
    const id = Math.random().toString(36).substr(2, 9);
    this.toasts.push({ id, props });
    this.notifyListeners();
    return id;
  }

  static remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  static subscribe(listener: (toasts: Array<{ id: string; props: Omit<ToastProps, 'onClose'> }>) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; props: Omit<ToastProps, 'onClose'> }>>([]);

  useEffect(() => {
    return ToastManager.subscribe(setToasts);
  }, []);

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast.props}
          onClose={() => ToastManager.remove(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;