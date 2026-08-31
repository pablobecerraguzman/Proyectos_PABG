import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Check,
  X,
  Search,
  Shield,
  Key,
  Lock,
  UserCheck,
  Building2,
} from 'lucide-react';
import { User, UserRole, UserStatus, UserPermissions } from '../types';

interface AdminUsersViewProps {
  currentUser: User;
  usersList: User[];
  onUpdateUser: (updatedUser: User) => void;
  onAddUser: (newUser: Partial<User>) => void;
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  currentUser,
  usersList,
  onUpdateUser,
  onAddUser,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Developer');
  const [newDepartment, setNewDepartment] = useState('Ingeniería de Software');

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePermission = (permissionKey: keyof UserPermissions) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [permissionKey]: !editingUser.permissions[permissionKey],
      },
    });
  };

  const handleSaveEditedUser = () => {
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
    onShowToast('success', 'Permisos Actualizados', `Se han guardado los cambios para ${editingUser.name}`);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    onAddUser({
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      status: 'Active',
      permissions: {
        manageUsers: newRole === 'Admin',
        deployToProduction: newRole === 'Admin' || newRole === 'Manager',
        approveReleases: newRole === 'Admin' || newRole === 'Manager',
        manageClients: newRole === 'Admin' || newRole === 'Manager',
        viewReports: true,
        resolveErrors: newRole !== 'Auditor',
      },
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    onShowToast('success', 'Usuario Registrado', `Se creó la cuenta para ${newName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Panel Administrador: Usuarios & Matriz de Permisos</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de roles (Admin, Manager, Developer, Auditor) y control de acceso a funciones críticas.
          </p>
        </div>

        <button
          id="btn-open-add-user"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario Corporativo</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            id="search-users-input"
            type="text"
            placeholder="Buscar por nombre, correo o departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol & Método Auth</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Permisos Clave</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={usr.avatar}
                        alt={usr.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{usr.name}</div>
                        <div className="text-[11px] text-slate-400">{usr.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {usr.role}
                      </span>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {usr.authMethod}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      usr.status === 'Active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {usr.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {usr.permissions.deployToProduction && (
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          Despliegue Prod
                        </span>
                      )}
                      {usr.permissions.manageUsers && (
                        <span className="bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded">
                          Gestión Usuarios
                        </span>
                      )}
                      {usr.permissions.approveReleases && (
                        <span className="bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">
                          Aprobar Releases
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {usr.lastLogin}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      id={`btn-edit-user-${usr.id}`}
                      onClick={() => setEditingUser(usr)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 border border-slate-700 transition cursor-pointer"
                      title="Editar rol y permisos"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span>Editar Permisos: {editingUser.name}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rol del Usuario
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Admin">Administrador (Acceso Total)</option>
                  <option value="Manager">Gerente de Producto / Release</option>
                  <option value="Developer">Desarrollador</option>
                  <option value="Auditor">Auditor (Solo Lectura)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Matriz de Permisos Específicos
                </label>
                <div className="space-y-2">
                  {[
                    { key: 'deployToProduction', label: 'Ejecutar Despliegues en Producción' },
                    { key: 'manageUsers', label: 'Administrar Usuarios y Asignar Roles' },
                    { key: 'approveReleases', label: 'Aprobar Releases y Changelogs' },
                    { key: 'manageClients', label: 'Registrar y Editar Clientes Corporativos' },
                    { key: 'resolveErrors', label: 'Resolver Errores e Incidencias Críticas' },
                  ].map((p) => {
                    const isChecked = editingUser.permissions[p.key as keyof UserPermissions];
                    return (
                      <div
                        key={p.key}
                        onClick={() => handleTogglePermission(p.key as keyof UserPermissions)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition"
                      >
                        <span className="text-xs text-slate-200">{p.label}</span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${
                          isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditedUser}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Crear Usuario Corporativo</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Gómez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="sofia.gomez@enterprise.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rol Inicial</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Admin">Administrador</option>
                  <option value="Manager">Gerente de Producto</option>
                  <option value="Developer">Desarrollador</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
