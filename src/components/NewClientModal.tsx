import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, X, Plus } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClientSubmit: (clientData: { name: string; code: string; sector: string; contactEmail: string; slaTier: 'Platinum' | 'Gold' | 'Silver'; notes?: string }) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClientSubmit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sector, setSector] = useState('Banca y Finanzas');
  const [contactEmail, setContactEmail] = useState('');
  const [slaTier, setSlaTier] = useState<'Platinum' | 'Gold' | 'Silver'>('Gold');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactEmail) return;

    onAddClientSubmit({
      name,
      code: code || name.substring(0, 3).toUpperCase() + '-CORP',
      sector,
      contactEmail,
      slaTier,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Registrar Nuevo Cliente Corporativo</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Empresa / Cliente</label>
            <input
              type="text"
              required
              placeholder="Ej: Multinacional de Seguros Viva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Código Identificador</label>
              <input
                type="text"
                placeholder="SEG-VIVA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nivel de SLA</label>
              <select
                value={slaTier}
                onChange={(e) => setSlaTier(e.target.value as 'Platinum' | 'Gold' | 'Silver')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Platinum">Platinum (99.99%)</option>
                <option value="Gold">Gold (99.9%)</option>
                <option value="Silver">Silver (99.5%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sector Industrial</label>
            <input
              type="text"
              placeholder="Ej: Finanzas / Telecomunicaciones"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo de Contacto TI</label>
            <input
              type="email"
              required
              placeholder="devops@cliente.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
            >
              Registrar Cliente
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
