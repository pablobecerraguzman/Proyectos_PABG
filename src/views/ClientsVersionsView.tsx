import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Search,
  Plus,
  ArrowUpCircle,
  RotateCcw,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Shield,
  Server,
  Filter,
} from 'lucide-react';
import { Client, EnvironmentType, User } from '../types';

interface ClientsVersionsViewProps {
  user: User;
  clients: Client[];
  onOpenUpgradeModal: (client: Client, env: EnvironmentType) => void;
  onOpenNewClientModal: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ClientsVersionsView: React.FC<ClientsVersionsViewProps> = ({
  user,
  clients,
  onOpenUpgradeModal,
  onOpenNewClientModal,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSla, setSelectedSla] = useState<string>('ALL');

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSla = selectedSla === 'ALL' || c.slaTier === selectedSla;
    return matchesSearch && matchesSla;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Control de Clientes & Versiones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de actualizaciones por ambiente (Producción, Staging, QA, Dev) y seguimiento de SLA.
          </p>
        </div>

        {user.permissions.manageClients && (
          <button
            id="btn-add-client"
            onClick={onOpenNewClientModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="search-clients-input"
            type="text"
            placeholder="Buscar por cliente, código o sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            id="filter-sla-select"
            value={selectedSla}
            onChange={(e) => setSelectedSla(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Todos los SLAs</option>
            <option value="Platinum">SLA Platinum (99.99%)</option>
            <option value="Gold">SLA Gold (99.9%)</option>
            <option value="Silver">SLA Silver (99.5%)</option>
          </select>
        </div>
      </div>

      {/* Clients List Cards */}
      <div className="space-y-6">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
          >
            {/* Client Top Information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-bold text-sm">
                  {client.code.substring(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{client.name}</h3>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {client.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>Sector: {client.sector}</span>
                    <span>•</span>
                    <span>Contacto: {client.contactEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  client.slaTier === 'Platinum'
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    : client.slaTier === 'Gold'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  SLA {client.slaTier}
                </span>
              </div>
            </div>

            {/* Environments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Production', 'Staging', 'QA', 'Dev'].map((envName) => {
                const env = client.environments.find((e) => e.env === envName);

                if (!env) {
                  return (
                    <div
                      key={envName}
                      className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 text-center flex flex-col justify-center items-center opacity-60"
                    >
                      <Server className="w-5 h-5 text-slate-600 mb-1" />
                      <span className="text-xs font-semibold text-slate-500">{envName}</span>
                      <span className="text-[10px] text-slate-600 mt-1">Ambiente no habilitado</span>
                    </div>
                  );
                }

                const isUpToDate = env.currentVersion === env.targetVersion;

                return (
                  <div
                    key={envName}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                      env.status === 'Failed'
                        ? 'bg-red-950/40 border-red-800/60'
                        : env.status === 'In_Progress'
                        ? 'bg-sky-950/40 border-sky-800/60'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Environment Title Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          envName === 'Production'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {envName}
                        </span>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          env.status === 'Success'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : env.status === 'Failed'
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : env.status === 'In_Progress'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {env.status}
                        </span>
                      </div>

                      {/* Versions */}
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-400">Versión Actual:</div>
                        <div className="font-mono text-sm font-bold text-white flex items-center justify-between">
                          <span>{env.currentVersion}</span>
                          {isUpToDate && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>

                        {!isUpToDate && (
                          <div className="text-[11px] text-amber-400 mt-1 font-mono">
                            Objetivo: <span className="font-bold">{env.targetVersion}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                        <span>Desplegado: {env.lastDeployedAt}</span>
                        <span className="font-bold text-slate-300">Salud: {env.healthScore}%</span>
                      </div>
                    </div>

                    {/* Action button */}
                    {user.permissions.deployToProduction && (
                      <button
                        id={`btn-upgrade-${client.id}-${envName}`}
                        onClick={() => onOpenUpgradeModal(client, envName as EnvironmentType)}
                        className="w-full py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>Actualizar / Cambiar Versión</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {client.notes && (
              <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                📝 <strong>Notas de Operación:</strong> {client.notes}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
