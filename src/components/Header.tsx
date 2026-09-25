import React from 'react';
import {
  Wrench,
  User as UserIcon,
  LogOut,
  Database,
  ArrowRightLeft,
  HardHat,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenSupabaseConfig: () => void;
  isSupabaseConfigured: boolean;
  onOpenNovoChamado?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSupabaseConfig,
  isSupabaseConfigured,
  onOpenNovoChamado,
}) => {
  const { currentUser, logout, switchUser } = useAuth();

  if (!currentUser) return null;

  const isOperador = currentUser.role === 'operador';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                TechChamados
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Manutenção Industrial
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gestão de Ordem de Serviço & Manutenção Preventiva e Corretiva
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Supabase status badge */}
          <button
            onClick={onOpenSupabaseConfig}
            title="Clique para configurar o banco de dados Supabase"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Supabase (Modo Local)'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* User profile & Role switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isOperador
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isOperador ? <HardHat className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {currentUser.name}
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                      isOperador
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isOperador ? 'Operador' : 'Mecânico'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  login: <code className="text-slate-300">{currentUser.username}</code>
                </div>
              </div>
            </div>

            {/* Quick role toggle */}
            <button
              onClick={() => switchUser(isOperador ? 'mecanico' : 'operador')}
              title={`Alternar para ${isOperador ? 'Mecânico' : 'Operador'}`}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                Trocar p/ {isOperador ? 'Mecânico' : 'Operador'}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sair do sistema"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
