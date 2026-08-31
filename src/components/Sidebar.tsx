import React from 'react';
import {
  LayoutDashboard,
  Layers,
  History,
  BarChart3,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  userRole: UserRole;
  activeErrorCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  userRole,
  activeErrorCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Principal',
      icon: LayoutDashboard,
      description: 'Métricas clave y estado general',
    },
    {
      id: 'clients',
      label: 'Clientes & Versiones',
      icon: Layers,
      description: 'Control de actualizaciones por cliente',
    },
    {
      id: 'deployments',
      label: 'Historial & Fechas',
      icon: History,
      description: 'Bitácora de despliegues y changelogs',
    },
    {
      id: 'reports',
      label: 'Reportes & Métricas',
      icon: BarChart3,
      description: 'Analítica detallada y exportación',
    },
    {
      id: 'errors',
      label: 'Alertas & Errores',
      icon: AlertOctagon,
      description: 'Notificaciones automáticas',
      badge: activeErrorCount > 0 ? activeErrorCount : undefined,
    },
    {
      id: 'admin',
      label: 'Panel Administrador',
      icon: ShieldCheck,
      description: 'Permisos de usuarios y roles',
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between shrink-0 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Navegación Corporativa
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && userRole !== 'Admin') return null;

              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    <div>
                      <div className="text-xs font-semibold leading-tight">{item.label}</div>
                      <div className={`text-[10px] ${isActive ? 'text-indigo-100/80' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {!item.badge && isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Health Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Estado del Servidor
            </span>
            <span className="text-[10px] font-mono text-emerald-400">99.98% SLA</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[99%]" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Latencia: 18ms</span>
            <span>Región: us-east1</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        <div>Nexus Release Portal</div>
        <div className="text-[10px] text-slate-600 mt-0.5">Seguridad OAuth2 & SSL Integrado</div>
      </div>
    </aside>
  );
};
