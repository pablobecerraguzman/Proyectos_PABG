import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpCircle, X, Check, Calendar, Play, AlertTriangle } from 'lucide-react';
import { Client, EnvironmentType, User } from '../types';

interface NewDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClient?: Client | null;
  initialEnv?: EnvironmentType | null;
  user: User;
  onUpgradeSubmit: (clientId: string, env: EnvironmentType, targetVersion: string, simulateFailure?: boolean) => void;
}

export const NewDeploymentModal: React.FC<NewDeploymentModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClient,
  initialEnv,
  user,
  onUpgradeSubmit,
}) => {
  if (!isOpen) return null;

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || clients[0]?.id || '');
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>(initialEnv || 'Staging');
  const [targetVersion, setTargetVersion] = useState('v3.6.0');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpgradeSubmit(selectedClientId, selectedEnv, targetVersion, simulateFailure);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-indigo-400" />
            <span>Ejecutar Actualización de Versión</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seleccionar Cliente
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ambiente Destino
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Production', 'Staging', 'QA', 'Dev'] as EnvironmentType[]).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSelectedEnv(e)}
                  className={`py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    selectedEnv === e
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Versión Destino
            </label>
            <input
              type="text"
              required
              placeholder="Ej: v3.6.0"
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              <span className="font-semibold block">Simular Falla de Despliegue</span>
              <span className="text-[10px] text-slate-400">Prueba la notificación automática de error</span>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Lanzar Despliegue</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
