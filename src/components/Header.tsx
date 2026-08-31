import React, { useState } from 'react';
import { User, NotificationError } from '../types';
import {
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  Building2,
  AlertOctagon,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  errors: NotificationError[];
  onSelectView: (view: string) => void;
  onTriggerTestError: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  errors,
  onSelectView,
  onTriggerTestError,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeErrors = errors.filter((e) => e.status === 'Active' || e.status === 'Investigating');
  const criticalCount = activeErrors.filter((e) => e.severity === 'Critical').length;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 text-slate-100">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">
              Nexus Corporate
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-semibold uppercase tracking-wider">
              Enterprise v3.6.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Portal de Control de Versiones & Despliegues
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Trigger Test Incident Button (Demonstrates real-time auto notifications) */}
        <button
          id="btn-trigger-test-error"
          onClick={onTriggerTestError}
          className="hidden sm:flex items-center gap-1.5 text-xs bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-300 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shadow-sm"
          title="Simular detección de error en tiempo real para notificaciones"
        >
          <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Simular Incidencia</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="btn-notifications-popover"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/60 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {activeErrors.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-slate-900">
                {activeErrors.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  <h3 className="font-semibold text-sm">Alertas del Sistema</h3>
                </div>
                {criticalCount > 0 && (
                  <span className="text-[11px] bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full font-medium">
                    {criticalCount} Críticas
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto my-2 space-y-2 pr-1">
                {activeErrors.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    Sin errores ni incidencias activas en el portal.
                  </div>
                ) : (
                  activeErrors.map((err) => (
                    <div
                      key={err.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onSelectView('errors');
                      }}
                      className="p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          err.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {err.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{err.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{err.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{err.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <button
                  id="btn-view-all-errors"
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectView('errors');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Ver centro de errores completas <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            id="btn-user-menu-dropdown"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-700/60"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold leading-tight text-slate-200">{user.name}</div>
              <div className="text-[10px] text-indigo-400 font-medium">{user.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
              <div className="p-2 border-b border-slate-800 mb-2">
                <div className="font-semibold text-sm text-slate-100">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300 border border-slate-700">
                    Dept: {user.department}
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>

              {user.role === 'Admin' && (
                <button
                  id="user-menu-admin-link"
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectView('admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center gap-2 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Panel Administrador (Permisos)</span>
                </button>
              )}

              <button
                id="btn-logout-header"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-950/60 text-xs flex items-center gap-2 text-red-400 hover:text-red-300 transition cursor-pointer mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
