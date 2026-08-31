import React, { useState, useEffect } from 'react';
import { User, Client, Deployment, ChangelogItem, NotificationError, EnvironmentType } from './types';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ClientsVersionsView } from './views/ClientsVersionsView';
import { DeploymentsHistoryView } from './views/DeploymentsHistoryView';
import { ReportsView } from './views/ReportsView';
import { AdminUsersView } from './views/AdminUsersView';
import { ErrorsNotificationsView } from './views/ErrorsNotificationsView';
import { NewDeploymentModal } from './components/NewDeploymentModal';
import { AiReleaseNotesModal } from './components/AiReleaseNotesModal';
import { NewClientModal } from './components/NewClientModal';

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // App Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [changelogs, setChangelogs] = useState<ChangelogItem[]>([]);
  const [errorsList, setErrorsList] = useState<NotificationError[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isNewDeploymentModalOpen, setIsNewDeploymentModalOpen] = useState(false);
  const [selectedClientForUpgrade, setSelectedClientForUpgrade] = useState<Client | null>(null);
  const [selectedEnvForUpgrade, setSelectedEnvForUpgrade] = useState<EnvironmentType | null>(null);

  const [isAiNotesModalOpen, setIsAiNotesModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Add Toast Notification
  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      const [cliRes, depRes, clRes, errRes, usrRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/deployments'),
        fetch('/api/changelogs'),
        fetch('/api/errors'),
        fetch('/api/admin/users'),
      ]);

      if (cliRes.ok) setClients(await cliRes.json());
      if (depRes.ok) setDeployments(await depRes.json());
      if (clRes.ok) setChangelogs(await clRes.json());
      if (errRes.ok) setErrorsList(await errRes.json());
      if (usrRes.ok) setUsersList(await usrRes.json());
    } catch (err) {
      console.error('Error loading backend data:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Auth Callbacks
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setToken(token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    addToast('info', 'Sesión Finalizada', 'Has cerrado sesión en Nexus Corporate Portal');
  };

  // Trigger test error (Incidencia)
  const handleTriggerTestError = async () => {
    try {
      const res = await fetch('/api/errors/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Falla Crítica de Conexión en Gateway de Pagos',
          message: 'Timeout (>5000ms) detectado al verificar la firma digital del certificado SSL.',
          severity: 'Critical',
          clientId: clients[0]?.id,
        }),
      });

      if (res.ok) {
        const newErr = await res.json();
        setErrorsList((prev) => [newErr, ...prev]);
        addToast(
          'error',
          '🚨 Alerta Crítica Detectada',
          `Se generó automáticamente una notificación de error para ${newErr.clientName}`
        );
      }
    } catch (err: any) {
      addToast('error', 'Fallo al simular error', err.message);
    }
  };

  // Upgrade / Rollback Submission
  const handleUpgradeSubmit = async (
    clientId: string,
    env: EnvironmentType,
    targetVersion: string,
    simulateFailure?: boolean
  ) => {
    try {
      addToast('info', 'Iniciando Despliegue', `Actualizando ambiente ${env} a ${targetVersion}...`);

      const res = await fetch(`/api/clients/${clientId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          env,
          targetVersion,
          deployedBy: currentUser?.name || 'Operador Nexus',
          simulateFailure,
        }),
      });

      if (res.ok) {
        setTimeout(async () => {
          await fetchAllData();
          if (simulateFailure) {
            addToast('error', 'Despliegue Fallido (Simulación)', 'Se activó la notificación de error en tiempo real.');
          } else {
            addToast('success', 'Despliegue Completado', `Versión ${targetVersion} instalada exitosamente.`);
          }
        }, 2800);
      }
    } catch (err: any) {
      addToast('error', 'Error en pipeline', err.message);
    }
  };

  // Add new client
  const handleAddClientSubmit = async (clientData: any) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (res.ok) {
        const newClient = await res.json();
        setClients((prev) => [...prev, newClient]);
        addToast('success', 'Cliente Registrado', `${newClient.name} ha sido agregado al portal.`);
      }
    } catch (err: any) {
      addToast('error', 'Fallo al agregar cliente', err.message);
    }
  };

  // Update user in admin panel
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        const saved = await res.json();
        setUsersList((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
        if (currentUser?.id === saved.id) {
          setCurrentUser(saved);
        }
      }
    } catch (err: any) {
      addToast('error', 'Fallo al actualizar usuario', err.message);
    }
  };

  // Add new user in admin panel
  const handleAddUser = async (userData: Partial<User>) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsersList((prev) => [...prev, newUser]);
      }
    } catch (err: any) {
      addToast('error', 'Fallo al agregar usuario', err.message);
    }
  };

  // Update error status
  const handleUpdateErrorStatus = async (
    id: string,
    status: 'Active' | 'Investigating' | 'Resolved',
    resolvedBy?: string
  ) => {
    try {
      const res = await fetch(`/api/errors/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolvedBy }),
      });

      if (res.ok) {
        const updatedErr = await res.json();
        setErrorsList((prev) => prev.map((e) => (e.id === updatedErr.id ? updatedErr : e)));
      }
    } catch (err: any) {
      addToast('error', 'Fallo al actualizar estado', err.message);
    }
  };

  // Active errors count for sidebar badge
  const activeErrorCount = errorsList.filter((e) => e.status === 'Active' || e.status === 'Investigating').length;

  if (!currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        <LoginView onLoginSuccess={handleLoginSuccess} onShowToast={addToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Corporate Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        errors={errorsList}
        onSelectView={setCurrentView}
        onTriggerTestError={handleTriggerTestError}
      />

      {/* Main Content Layout */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          userRole={currentUser.role}
          activeErrorCount={activeErrorCount}
        />

        {/* Dynamic View Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentView === 'dashboard' && (
            <DashboardView
              user={currentUser}
              clients={clients}
              deployments={deployments}
              errors={errorsList}
              onSelectView={setCurrentView}
              onOpenNewDeploymentModal={() => {
                setSelectedClientForUpgrade(null);
                setSelectedEnvForUpgrade(null);
                setIsNewDeploymentModalOpen(true);
              }}
              onTriggerTestError={handleTriggerTestError}
            />
          )}

          {currentView === 'clients' && (
            <ClientsVersionsView
              user={currentUser}
              clients={clients}
              onOpenUpgradeModal={(client, env) => {
                setSelectedClientForUpgrade(client);
                setSelectedEnvForUpgrade(env);
                setIsNewDeploymentModalOpen(true);
              }}
              onOpenNewClientModal={() => setIsNewClientModalOpen(true)}
              onShowToast={addToast}
            />
          )}

          {currentView === 'deployments' && (
            <DeploymentsHistoryView
              user={currentUser}
              deployments={deployments}
              changelogs={changelogs}
              onOpenAiNotesModal={() => setIsAiNotesModalOpen(true)}
              onOpenNewChangelogModal={() => setIsAiNotesModalOpen(true)}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              clients={clients}
              deployments={deployments}
              errors={errorsList}
              onShowToast={addToast}
            />
          )}

          {currentView === 'admin' && (
            <AdminUsersView
              currentUser={currentUser}
              usersList={usersList}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onShowToast={addToast}
            />
          )}

          {currentView === 'errors' && (
            <ErrorsNotificationsView
              user={currentUser}
              errorsList={errorsList}
              onTriggerTestError={handleTriggerTestError}
              onUpdateErrorStatus={handleUpdateErrorStatus}
              onShowToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewDeploymentModal
        isOpen={isNewDeploymentModalOpen}
        onClose={() => setIsNewDeploymentModalOpen(false)}
        clients={clients}
        initialClient={selectedClientForUpgrade}
        initialEnv={selectedEnvForUpgrade}
        user={currentUser}
        onUpgradeSubmit={handleUpgradeSubmit}
      />

      <AiReleaseNotesModal
        isOpen={isAiNotesModalOpen}
        onClose={() => setIsAiNotesModalOpen(false)}
        onShowToast={addToast}
      />

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAddClientSubmit={handleAddClientSubmit}
      />
    </div>
  );
}
