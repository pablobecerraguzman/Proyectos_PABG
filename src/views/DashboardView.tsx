import React from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Play,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Client, Deployment, NotificationError, User } from '../types';

interface DashboardViewProps {
  user: User;
  clients: Client[];
  deployments: Deployment[];
  errors: NotificationError[];
  onSelectView: (view: string) => void;
  onOpenNewDeploymentModal: () => void;
  onTriggerTestError: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  clients,
  deployments,
  errors,
  onSelectView,
  onOpenNewDeploymentModal,
  onTriggerTestError,
}) => {
  // Compute Key Metrics
  const totalClients = clients.length;
  
  // Calculate percentage of clients whose Production environment is on v3.5.2 or higher
  const updatedClientsCount = clients.filter((c) => {
    const prodEnv = c.environments.find((e) => e.env === 'Production');
    return prodEnv && (prodEnv.currentVersion.includes('3.5.2') || prodEnv.currentVersion.includes('3.6'));
  }).length;

  const upToDatePercentage = Math.round((updatedClientsCount / (totalClients || 1)) * 100);

  const activeErrors = errors.filter((e) => e.status === 'Active' || e.status === 'Investigating');
  const recentDeployments = deployments.slice(0, 5);
  const successfulDeployments = deployments.filter((d) => d.status === 'Success').length;
  const deploymentSuccessRate = Math.round((successfulDeployments / (deployments.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ¡Hola, {user.name}! 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Resumen corporativo en tiempo real del estado de despliegue y versiones para los clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-quick-new-deployment"
            onClick={onOpenNewDeploymentModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Nueva Actualización</span>
          </button>

          <button
            id="btn-quick-reports"
            onClick={() => onSelectView('reports')}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Ver Reportes</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Clientes Activos</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalClients}</span>
            <span className="text-xs text-slate-400">empresas en plataforma</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Cobertura SLA</span>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Clientes Actualizados</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{upToDatePercentage}%</span>
            <span className="text-xs text-slate-400">({updatedClientsCount}/{totalClients} en v3.5.2+)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Versión recomendada: <span className="font-mono text-indigo-300">v3.5.2</span>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tasa de Éxito Despliegues</span>
            <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center border border-sky-800/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{deploymentSuccessRate}%</span>
            <span className="text-xs text-slate-400">({successfulDeployments} exitosos)</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-400">
            Tiempo medio: ~4.2 minutos
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Incidencias / Errores Activos</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              activeErrors.length > 0
                ? 'bg-red-950 text-red-400 border-red-800/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${activeErrors.length > 0 ? 'text-red-400' : 'text-white'}`}>
              {activeErrors.length}
            </span>
            <span className="text-xs text-slate-400">requieren atención</span>
          </div>
          <button
            id="kpi-btn-errors"
            onClick={() => onSelectView('errors')}
            className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Ver detalle de errores</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      {/* Critical Active Alert Warning Banner (If any) */}
      {activeErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-center justify-between gap-4 text-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-900/60 text-red-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-300">
                Alerta Crítica Detectada ({activeErrors.length})
              </h4>
              <p className="text-xs text-red-200/90 mt-0.5">
                {activeErrors[0].title} — <span className="font-semibold">{activeErrors[0].clientName}</span> ({activeErrors[0].environment})
              </p>
            </div>
          </div>
          <button
            id="btn-resolve-active-banner"
            onClick={() => onSelectView('errors')}
            className="bg-red-800 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
          >
            Diagnosticar con IA
          </button>
        </div>
      )}

      {/* Main Grid: Client Environment Matrix & Recent Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Client Updates Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Estado de Versiones por Cliente</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Resumen de ambientes de Producción, Staging y QA para cada cliente
              </p>
            </div>
            <button
              id="btn-goto-clients"
              onClick={() => onSelectView('clients')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Gestión completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Producción</th>
                  <th className="py-2.5 px-3">Staging</th>
                  <th className="py-2.5 px-3 text-right">Salud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {clients.map((client) => {
                  const prod = client.environments.find((e) => e.env === 'Production');
                  const staging = client.environments.find((e) => e.env === 'Staging');

                  return (
                    <tr key={client.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{client.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{client.code} • {client.sector}</div>
                      </td>

                      <td className="py-3 px-3">
                        {prod ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-300 font-semibold">
                              <span>{prod.currentVersion}</span>
                              {prod.status === 'Success' && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Despliegue Exitoso" />
                              )}
                              {prod.status === 'Failed' && (
                                <span className="w-2 h-2 rounded-full bg-red-400" title="Error en Despliegue" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">{prod.lastDeployedAt}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[10px]">Sin prod</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {staging ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs text-slate-300">{staging.currentVersion}</span>
                            <div className="text-[10px] text-slate-400">{staging.lastDeployedAt}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[10px]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {prod ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            prod.healthScore >= 95
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : prod.healthScore >= 85
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {prod.healthScore}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 col): Recent Deployments Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Últimos Despliegues</span>
            </h3>
            <button
              id="btn-goto-deployments"
              onClick={() => onSelectView('deployments')}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver bitácora</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentDeployments.map((dep) => (
              <div
                key={dep.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 line-clamp-1">{dep.clientName}</span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    dep.status === 'Success'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : dep.status === 'Failed'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : dep.status === 'In_Progress'
                      ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {dep.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-indigo-300 font-semibold">{dep.version} ({dep.environment})</span>
                  <span className="text-slate-500 font-mono">{dep.deployedAt}</span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  Ejecutado por: <span className="text-slate-300">{dep.deployedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
