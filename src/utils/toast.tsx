import toast, { Toast } from 'react-hot-toast';
import React from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  t: Toast;
  message: string;
  type?: ToastType;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'error':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'warning':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

const CustomToast = ({ t, message, type = 'success' }: ToastProps) => (
  <div
    className={`${
      t.visible ? 'animate-enter' : 'animate-leave'
    } max-w-md w-auto bg-[#FFFAF5] shadow-[0_12px_36px_rgba(61,43,31,0.14)] rounded-2xl pointer-events-auto flex items-center border border-[#E3C9A8] overflow-hidden px-2.5 py-2 backdrop-blur-md transition-all duration-300`}
  >
    <div className="flex items-center gap-3 pl-1 py-0.5 flex-1 min-w-0">
      <div className="flex-shrink-0 text-[#C4896A] bg-[#FEF5EC] p-2 rounded-xl border border-[#E3C9A8]/60 shadow-sm">
        <ToastIcon type={type} />
      </div>
      <div className="flex-1 pr-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium tracking-wide text-[#3D2B1F] leading-snug">
          {message}
        </p>
      </div>
    </div>
    <div className="flex border-l border-[#E3C9A8]/50 ml-2 pl-2 flex-shrink-0">
      <button
        onClick={() => toast.dismiss(t.id)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#C4896A]/70 hover:text-[#C4896A] hover:bg-[#FEF5EC] focus:outline-none transition-all duration-200"
      >
        <span className="sr-only">Close</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  </div>
);

export const showToast = {
  success: (message: string, id?: string) => {
    toast.custom((t: Toast) => <CustomToast t={t} message={message} type="success" />, {
      id,
      duration: 3500,
    });
  },

  error: (message: string, id?: string) => {
    toast.custom((t: Toast) => <CustomToast t={t} message={message} type="error" />, {
      id,
      duration: 4000,
    });
  },

  info: (message: string, id?: string) => {
    toast.custom((t: Toast) => <CustomToast t={t} message={message} type="info" />, {
      id,
      duration: 3500,
    });
  },

  warning: (message: string, id?: string) => {
    toast.custom((t: Toast) => <CustomToast t={t} message={message} type="warning" />, {
      id,
      duration: 4000,
    });
  },
};
