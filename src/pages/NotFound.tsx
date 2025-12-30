import React from "react";

// Premium mock Button component
const Button = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-10">
    <button className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 rounded-full text-white font-semibold tracking-wide shadow-xl shadow-indigo-500/30 hover:shadow-fuchsia-500/40 hover:scale-105 transition-all duration-300">
      {children}
    </button>
  </div>
);

export default function NotFoundPreview() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center text-white p-6 text-center font-[ui-serif] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-xl">
        <span className="inline-block mb-6 px-4 py-1 rounded-full border border-white/20 text-sm tracking-widest uppercase opacity-80">
          Error
        </span>

        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Page Not Found
        </h2>

        <p className="text-lg md:text-xl opacity-80 leading-relaxed mb-10">
          The page you are trying to access doesn’t exist or has been moved. Please return to a safe location.
        </p>

        <Button>Return to Home</Button>

        <p className="mt-8 text-sm opacity-60">
          If you believe this is an error, contact support.
        </p>
      </div>
    </div>
  );
}
