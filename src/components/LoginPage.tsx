import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  User as UserIcon,
  HardHat,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onOpenSupabaseConfig: () => void;
  isSupabaseConfigured: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onOpenSupabaseConfig,
  isSupabaseConfigured,
}) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const result = login(username, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  const handleQuickLogin = (userRole: 'operador' | 'mecanico') => {
    if (userRole === 'operador') {
      setUsername('operador');
      setPassword('operador123');
      login('operador', 'operador123');
    } else {
      setUsername('mecanico');
      setPassword('mecanico123');
      login('mecanico', 'mecanico123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-xl shadow-amber-500/20 mb-2">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TechChamados
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Sistema Industrial de Abertura & Encerramento de Chamados de Manutenção
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Acesso ao Sistema
            </h2>
            <button
              type="button"
              onClick={onOpenSupabaseConfig}
              className={`text-[11px] font-medium px-2 py-1 rounded-md border flex items-center gap-1.5 transition ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Configurar Supabase'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Usuário (Login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operador ou mecanico"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Entrar no Sistema
            </button>
          </form>

          {/* Quick Access Badges for Quick Testing */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400 font-medium">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Acesso Rápido com Credenciais Definidas:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Card Operador */}
              <button
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-sky-500/30 text-left transition group hover:border-sky-500/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                      <HardHat className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Operador</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div>user: <strong className="text-sky-300">operador</strong></div>
                  <div>senha: <strong className="text-sky-300">operador123</strong></div>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 leading-tight">
                  Abre chamados com descrição
                </div>
              </button>

              {/* Card Mecânico */}
              <button
                type="button"
                onClick={() => handleQuickLogin('mecanico')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-amber-500/30 text-left transition group hover:border-amber-500/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-white">Mecânico</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div>user: <strong className="text-amber-300">mecanico</strong></div>
                  <div>senha: <strong className="text-amber-300">mecanico123</strong></div>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 leading-tight">
                  Encerra e relata intervenção
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>Pronto para integração direta com Supabase</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </div>
  );
};
