import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertOctagon,
  Zap,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  XCircle,
  Terminal,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { NotificationError, User } from '../types';

interface ErrorsNotificationsViewProps {
  user: User;
  errorsList: NotificationError[];
  onTriggerTestError: () => void;
  onUpdateErrorStatus: (id: string, status: 'Active' | 'Investigating' | 'Resolved', resolvedBy?: string) => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ErrorsNotificationsView: React.FC<ErrorsNotificationsViewProps> = ({
  user,
  errorsList,
  onTriggerTestError,
  onUpdateErrorStatus,
  onShowToast,
}) => {
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiDiagnoses, setAiDiagnoses] = useState<Record<string, string>>({});
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredErrors = errorsList.filter((e) => {
    return severityFilter === 'ALL' || e.severity === severityFilter;
  });

  const handleFetchAiDiagnosis = async (errItem: NotificationError) => {
    setAiLoadingId(errItem.id);
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorMessage: errItem.message,
          stackTrace: errItem.stackTrace,
          clientName: errItem.clientName,
          version: errItem.affectedVersion,
        }),
      });

      const data = await response.json();
      setAiDiagnoses((prev) => ({
        ...prev,
        [errItem.id]: data.diagnosis || 'No se pudo obtener diagnóstico.',
      }));
      onShowToast('success', 'Diagnóstico de Gemini IA Generado', 'Se ha analizado el error.');
    } catch (err: any) {
      onShowToast('error', 'Error al llamar a la IA', err.message);
    } finally {
      setAiLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-400" />
            <span>Notificaciones Automáticas & Centro de Errores</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detección proactiva de fallas en despliegues, monitoreo de excepciones y diagnóstico con IA.
          </p>
        </div>

        <button
          id="btn-trigger-test-error-view"
          onClick={onTriggerTestError}
          className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <Zap className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Simular Incidencia en Tiempo Real</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <span className="text-xs font-semibold text-slate-400">Filtrar por Severidad:</span>
        <div className="flex gap-2">
          {['ALL', 'Critical', 'Warning', 'Info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {sev === 'ALL' ? 'Todos' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {filteredErrors.map((errItem) => {
          const isExpanded = expandedErrorId === errItem.id;
          const currentAiDiagnosis = aiDiagnoses[errItem.id] || errItem.aiDiagnosis;

          return (
            <motion.div
              key={errItem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border shadow-xl p-5 transition space-y-4 ${
                errItem.status === 'Resolved'
                  ? 'bg-slate-900/60 border-slate-800'
                  : errItem.severity === 'Critical'
                  ? 'bg-red-950/30 border-red-800/80'
                  : 'bg-amber-950/20 border-amber-800/60'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border mt-0.5 ${
                    errItem.severity === 'Critical'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{errItem.title}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        errItem.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {errItem.severity}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        errItem.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {errItem.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                      <span>Código: {errItem.code}</span>
                      {errItem.clientName && <span>• Cliente: {errItem.clientName} ({errItem.environment})</span>}
                      <span>• Timestamp: {errItem.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {errItem.status !== 'Resolved' && user.permissions.resolveErrors && (
                    <button
                      id={`btn-resolve-error-${errItem.id}`}
                      onClick={() => {
                        onUpdateErrorStatus(errItem.id, 'Resolved', user.name);
                        onShowToast('success', 'Incidencia Resuelta', `Marcada como resuelta por ${user.name}`);
                      }}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Marcar Resuelto
                    </button>
                  )}

                  <button
                    onClick={() => setExpandedErrorId(isExpanded ? null : errItem.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {errItem.message}
              </p>

              {/* Expanded details & AI Diagnosis */}
              {isExpanded && (
                <div className="space-y-4 pt-3 border-t border-slate-800/80">
                  {/* AI Diagnosis Block */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Análisis & Diagnóstico Automatizado Gemini IA</span>
                      </span>

                      <button
                        onClick={() => handleFetchAiDiagnosis(errItem)}
                        disabled={aiLoadingId === errItem.id}
                        className="text-[11px] bg-indigo-800/80 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        {aiLoadingId === errItem.id ? 'Analizando...' : 'Re-evaluar con IA'}
                      </button>
                    </div>

                    <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                      {currentAiDiagnosis || 'Haga clic en "Re-evaluar con IA" para obtener un diagnóstico con Gemini.'}
                    </div>
                  </div>

                  {/* Stack Trace */}
                  {errItem.stackTrace && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        Stack Trace de Excepción:
                      </span>
                      <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-red-300 overflow-x-auto border border-slate-800">
                        {errItem.stackTrace}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
