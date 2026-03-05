import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute w-96 h-96 bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* HMS Medical Logo Icon */}
          <div className="relative mb-8">
            {/* Pulsing Outer Rings */}
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse scale-150"></div>

            {/* The Main Icon Container */}
            <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl border border-indigo-50 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-indigo-600 animate-heartbeat"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h3l2-3 2 6 1-3h2"
                  className="animate-draw"
                />
              </svg>
            </div>
          </div>

          {/* Branding Text */}
          <div className="text-center">
            <div className="text-3xl font-black text-slate-800 tracking-tighter italic" style={{ fontFamily: 'serif' }}>
              <span className="text-3xl font-black tracking-tight text-slate-900">
                HMS<span className="text-indigo-600 text-3xl">Care</span>
              </span>
            </div>

            <div className="flex items-center gap-2 justify-center mt-2">
              <span className="h-[2px] w-4 bg-indigo-400 rounded-full"></span>
              <p className="text-slate-400 uppercase text-[10px] tracking-[0.3em] font-bold">
                Advanced Medical Technology
              </p>
              <span className="h-[2px] w-4 bg-indigo-400 rounded-full"></span>
            </div>
          </div>

          {/* Minimal Progress Bar */}
          <div className="mt-10 w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-loading-bar"></div>
          </div>
        </div>

        <style>
          {`
            @keyframes heartbeat {
              0% { transform: scale(1); }
              14% { transform: scale(1.1); }
              28% { transform: scale(1); }
              42% { transform: scale(1.1); }
              70% { transform: scale(1); }
            }
            @keyframes draw {
              0% { stroke-dasharray: 0 100; stroke-dashoffset: 0; }
              100% { stroke-dasharray: 100 0; stroke-dashoffset: 0; }
            }
            @keyframes loading-bar {
              0% { width: 0%; transform: translateX(-100%); }
              50% { width: 50%; transform: translateX(0%); }
              100% { width: 100%; transform: translateX(100%); }
            }
            .animate-heartbeat {
              animation: heartbeat 1.5s infinite ease-in-out;
            }
            .animate-loading-bar {
              animation: loading-bar 2s infinite ease-in-out;
            }
            .animate-draw {
              stroke-dasharray: 20;
              animation: draw 2s infinite linear;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <main>
      <Outlet />
    </main>
  );
}

export default App;