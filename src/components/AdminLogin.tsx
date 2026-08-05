import React, { useState } from 'react';
import { Lock, User, ShieldCheck, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import logoKariadi from '../assets/images/Logo_RS_Kariadi_Resmi.png';
import logoPpni from '../assets/images/logo ppni.png';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'adminwebinar' && password.trim() === 'hut101') {
      setError('');
      sessionStorage.setItem('admin_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Username atau password admin salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 p-8 text-white text-center relative">
          <button
            onClick={onBackToHome}
            className="absolute top-4 left-4 p-2 text-cyan-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Web Utama</span>
          </button>

          <div className="flex items-center justify-center gap-3 mb-4 pt-2">
            <div className="bg-white/95 p-2 rounded-xl">
              <img src={logoKariadi} alt="RSUP Dr. Kariadi" className="h-8 object-contain" />
            </div>
            <div className="bg-white/95 p-2 rounded-xl">
              <img src={logoPpni} alt="DPK PPNI" className="h-9 object-contain scale-110" />
            </div>
          </div>

          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-400/30 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Admin Portal Pendaftar
          </h1>
          <p className="text-xs text-cyan-200/80 mt-1 font-medium">
            Parade Webinar Nasional HUT Ke-101 RSUP Dr. Kariadi
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Username Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="adminwebinar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm font-semibold text-slate-800 transition-all"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm font-semibold text-slate-800 transition-all"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 text-sm font-extrabold text-white bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 rounded-2xl shadow-lg shadow-cyan-700/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>MASUK APLIKASI ADMIN</span>
            </button>
          </form>

          {/* Hint Credentials Box */}
          <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-900 font-medium space-y-1">
            <span className="font-extrabold text-cyan-800 block">Kredensial Default Admin:</span>
            <p>Username: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">adminwebinar</code></p>
            <p>Password: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">hut101</code></p>
          </div>
        </div>

      </div>
    </div>
  );
};
