import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        border: '1px solid #C4896A',
        padding: '12px 20px',
        color: '#3D2B1F',
        background: '#FFFAF5',
        fontFamily: "'Cinzel', serif",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(196,137,106,0.15)",
        borderRadius: "8px"
      },
      iconTheme: {
        primary: '#C4896A',
        secondary: '#FFFAF5',
      },
      duration: 3000,
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        border: '1px solid #ef4444',
        padding: '12px 20px',
        color: '#3D2B1F',
        background: '#FFFAF5',
        fontFamily: "'Cinzel', serif",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(239,68,68,0.15)",
        borderRadius: "8px"
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#FFFAF5',
      },
      duration: 3000,
    });
  }
};
