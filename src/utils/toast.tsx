import toast, { Toast } from 'react-hot-toast';

export const showToast = {
  success: (message: string, id?: string) => {
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-auto bg-[#FFFAF5] shadow-[0_8px_30px_rgba(196,137,106,0.15)] rounded-2xl pointer-events-auto flex items-center border border-[#E3C9A8]/70 overflow-hidden px-1 py-1 pr-2 backdrop-blur-md`}
        >
          <div className="flex items-center gap-3 pl-2 py-1">
            <div className="flex-shrink-0 text-[#C4896A] bg-[#FEF5EC] p-2 rounded-full border border-[#E3C9A8]/30">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="flex-1 pr-2">
              <p className="text-sm font-medium tracking-wide text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
                {message}
              </p>
            </div>
          </div>
          <div className="flex border-l border-[#E3C9A8]/30 ml-2 pl-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4896A]/60 hover:text-[#C4896A] hover:bg-[#FDF0E6] focus:outline-none transition-all duration-300"
            >
              <span className="sr-only">Close</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      ),
      { id, duration: 3000 }
    );
  },
  
  error: (message: string, id?: string) => {
    toast.custom(
      (t: Toast) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-auto bg-[#FFF5F5] shadow-[0_8px_30px_rgba(239,68,68,0.15)] rounded-full pointer-events-auto flex items-center border border-[#FECACA] overflow-hidden px-1 py-1 pr-2 backdrop-blur-md`}
        >
          <div className="flex items-center gap-3 pl-2 py-1">
            <div className="flex-shrink-0 text-red-500 bg-red-50 p-2 rounded-full border border-red-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="flex-1 pr-2">
              <p className="text-sm font-medium tracking-wide text-[#3D2B1F]" style={{ fontFamily: "'Cinzel', serif" }}>
                {message}
              </p>
            </div>
          </div>
          <div className="flex border-l border-red-200 ml-2 pl-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 focus:outline-none transition-all duration-300"
            >
              <span className="sr-only">Close</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      ),
      { id, duration: 3000 }
    );
  }
};
