import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  GitCommit,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  ExternalLink,
  Tag,
  UserCheck,
} from 'lucide-react';
import { Deployment, ChangelogItem, User } from '../types';

interface DeploymentsHistoryViewProps {
  user: User;
  deployments: Deployment[];
  changelogs: ChangelogItem[];
  onOpenAiNotesModal: () => void;
  onOpenNewChangelogModal: () => void;
}

export const DeploymentsHistoryView: React.FC<DeploymentsHistoryViewProps> = ({
  user,
  deployments,
  changelogs,
  onOpenAiNotesModal,
  onOpenNewChangelogModal,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'changelogs'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredDeployments = deployments.filter((d) => {
    const matchesSearch =
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deployedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & AI Release Notes Helper Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Historial Completo de Cambios & Fechas de Despliegue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro auditable de lanzamientos, commits, responsables y notas de versión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-ai-release-notes"
            onClick={onOpenAiNotesModal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar Release Notes con IA</span>
          </button>

          {user.permissions.approveReleases && (
            <button
              id="btn-new-changelog"
              onClick={onOpenNewChangelogModal}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Bitácora de Despliegues vs Registro de Versiones (Changelogs) */}
      <div className="flex border-b border-slate-800">
        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Bitácora de Despliegues ({deployments.length})</span>
        </button>

        <button
          id="tab-changelogs"
          onClick={() => setActiveTab('changelogs')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'changelogs'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Historial de Versiones & Parches ({changelogs.length})</span>
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="search-deployments-input"
                type="text"
                placeholder="Buscar por cliente, versión o desplegado por..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Success">Exitoso</option>
              <option value="Failed">Fallido</option>
              <option value="In_Progress">En Progreso</option>
              <option value="Scheduled">Programado</option>
            </select>
          </div>

          {/* Timeline List */}
          <div className="space-y-3">
            {filteredDeployments.map((dep) => (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl mt-0.5 border ${
                    dep.status === 'Success'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                      : dep.status === 'Failed'
                      ? 'bg-red-950/80 text-red-400 border-red-800/60'
                      : dep.status === 'In_Progress'
                      ? 'bg-sky-950/80 text-sky-400 border-sky-800/60'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {dep.status === 'Success' && <CheckCircle2 className="w-5 h-5" />}
                    {dep.status === 'Failed' && <XCircle className="w-5 h-5" />}
                    {dep.status === 'In_Progress' && <Clock className="w-5 h-5 animate-spin" />}
                    {dep.status === 'Scheduled' && <Calendar className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{dep.clientName}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-bold">
                        {dep.environment}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        dep.status === 'Success'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : dep.status === 'Failed'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {dep.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {dep.releaseNotesSummary}
                    </p>

                    {dep.failureReason && (
                      <div className="mt-2 text-xs font-mono bg-red-950/60 text-red-300 p-2 rounded-lg border border-red-800/50">
                        ❌ Motivo de Falla: {dep.failureReason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1 font-mono text-indigo-300">
                        <GitCommit className="w-3.5 h-3.5" />
                        Commit #{dep.commitHash} ({dep.previousVersion} → {dep.version})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        Por: {dep.deployedBy}
                      </span>
                      <span>•</span>
                      <span>Fecha: {dep.deployedAt}</span>
                    </div>
                  </div>
                </div>

                {dep.durationSeconds && (
                  <div className="text-right shrink-0 font-mono text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div>Duración</div>
                    <div className="text-slate-200 font-bold">{dep.durationSeconds}s</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Changelogs Registry */
        <div className="space-y-4">
          {changelogs.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-xl border border-indigo-800">
                    {item.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    item.category === 'Feature'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : item.category === 'Security'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {item.category}
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-mono">{item.releaseDate}</span>
              </div>

              <h3 className="font-bold text-base text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Autor: <strong className="text-slate-200">{item.author}</strong></span>
                {item.pullRequestUrl && (
                  <a
                    href={item.pullRequestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <span>Ver Pull Request</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
