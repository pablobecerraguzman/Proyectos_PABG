import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Copy, Check, FileText } from 'lucide-react';

interface AiReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AiReleaseNotesModal: React.FC<AiReleaseNotesModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [version, setVersion] = useState('v3.6.0');
  const [features, setFeatures] = useState(
    'Módulo de notificaciones automáticas en tiempo real, autenticación OAuth2 con popup, mejoras de velocidad en consultas SQL y parche de seguridad TLS 1.3.'
  );
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/release-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, features }),
      });

      const data = await response.json();
      setGeneratedNotes(data.notes || 'No se pudieron generar las notas.');
      onShowToast('success', 'Release Notes Generadas', 'Se crearon las notas de la versión con Gemini IA.');
    } catch (err: any) {
      onShowToast('error', 'Error al llamar a Gemini', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('info', 'Copiado', 'Notas copiadas al portapapeles.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Generador de Release Notes con IA</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Versión
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lista de Cambios / Commits
            </label>
            <textarea
              rows={3}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Redactando con Gemini...' : 'Redactar Notas Profesionales'}</span>
          </button>

          {generatedNotes && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Resultado Generado:</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto font-sans">
                {generatedNotes}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
