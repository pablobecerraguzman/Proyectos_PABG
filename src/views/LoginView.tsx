import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Globe,
  Github,
  CheckCircle2,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'oauth'>('local');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth Popup postMessage listener
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin pattern for security
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { user, token } = event.data;
        onShowToast(
          'success',
          'Autenticación OAuth2 Exitosa',
          `Bienvenido ${user.name} (${user.department})`
        );
        onLoginSuccess(user, token);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onLoginSuccess, onShowToast]);

  // Local authentication handler
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'carlos.mendoza@enterprise.com',
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo en la autenticación local');
      }

      onShowToast('success', 'Sesión Iniciada', `Bienvenido al portal, ${data.user.name}`);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      onShowToast('error', 'Error de Autenticación', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset demo account login button handler
  const handlePresetLogin = (presetEmail: string, role: UserRole) => {
    setEmail(presetEmail);
    setSelectedRole(role);
    setPassword('enterprise123');

    // Automatically submit form with preset credentials
    setIsLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: presetEmail, role }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        onShowToast('success', 'Sesión Iniciada con Perfil Preset', `Rol: ${data.user.role}`);
        onLoginSuccess(data.user, data.token);
      })
      .catch((err) => {
        setIsLoading(false);
        onShowToast('error', 'Error de Inicio Rápido', err.message);
      });
  };

  // OAuth2 Popup trigger handler (Complying with AI Studio OAuth guidelines)
  const handleOAuthTrigger = async (provider: 'google' | 'github' | 'corporate_sso') => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/auth/url?provider=${provider}`);
      if (!res.ok) throw new Error('No se pudo obtener la URL de OAuth');
      const { url } = await res.json();

      // Open OAuth provider directly in popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
      );

      if (!popup) {
        onShowToast(
          'warning',
          'Ventana Emergente Bloqueada',
          'Por favor, permita emergentes (popups) en su navegador para completar el login OAuth2.'
        );
      }
    } catch (err: any) {
      onShowToast('error', 'Fallo OAuth2', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Branding */}
        <div className="p-8 border-b border-slate-800 text-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-sky-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Nexus Corporate Portal
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Plataforma de Control de Versiones, Historial de Cambios y Despliegues para Clientes
          </p>
        </div>

        {/* Tab Selection: Local vs OAuth2 */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            id="tab-login-local"
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'local'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Autenticación Local</span>
          </button>

          <button
            id="tab-login-oauth"
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'oauth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Autenticación OAuth2 / SSO</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8">
          {activeTab === 'local' ? (
            <div className="space-y-6">
              {/* Presets Quick Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Selección Rápida de Perfiles Demo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="preset-admin"
                    onClick={() => handlePresetLogin('carlos.mendoza@enterprise.com', 'Admin')}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-400">
                        Administrador
                      </span>
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Carlos Mendoza (DevOps)</span>
                  </button>

                  <button
                    type="button"
                    id="preset-manager"
                    onClick={() => handlePresetLogin('ana.rodriguez@enterprise.com', 'Manager')}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-400">
                        Gerente de Producto
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Ana Sofía (Release Mgmt)</span>
                  </button>

                  <button
                    type="button"
                    id="preset-developer"
                    onClick={() => handlePresetLogin('javier.castillo@enterprise.com', 'Developer')}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-400">
                        Desarrollador
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Javier Castillo (Ingeniería)</span>
                  </button>

                  <button
                    type="button"
                    id="preset-auditor"
                    onClick={() => handlePresetLogin('lucia.morales@enterprise.com', 'Auditor')}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-400">
                        Auditor Calidad
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Lucía Morales (Auditoría)</span>
                  </button>
                </div>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-500">
                  <span className="bg-slate-900 px-3">O Ingrese Credenciales Manuales</span>
                </div>
              </div>

              {/* Form Manual Login */}
              <form onSubmit={handleLocalLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Correo Electrónico Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-login-email"
                      type="email"
                      required
                      placeholder="usuario@enterprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      id="input-login-password"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login-local"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                >
                  {isLoading ? (
                    <span>Iniciando sesión...</span>
                  ) : (
                    <>
                      <span>Acceder al Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* OAuth2 Login Options */
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-400 text-center mb-4">
                Seleccione su proveedor de identidad corporativo mediante el estándar OAuth2:
              </p>

              <button
                type="button"
                id="btn-oauth-google"
                onClick={() => handleOAuthTrigger('google')}
                className="w-full p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-slate-900 text-xs">
                    G
                  </div>
                  <span>Google Workspace SSO (Empresarial)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                id="btn-oauth-github"
                onClick={() => handleOAuthTrigger('github')}
                className="w-full p-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Github className="w-6 h-6 text-white" />
                  <span>GitHub Enterprise OAuth2</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                id="btn-oauth-sso"
                onClick={() => handleOAuthTrigger('corporate_sso')}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-850 border border-indigo-700/60 text-indigo-200 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <span>Single Sign-On Corporativo Okta / Azure AD</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>

              <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                🔒 <strong>Seguridad OAuth2:</strong> Se abrirá una ventana emergente segura enviada directamente por el proveedor de autenticación de acuerdo con los estándares de seguridad corporativa.
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
