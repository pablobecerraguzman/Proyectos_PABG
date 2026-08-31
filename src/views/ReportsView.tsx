import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Client, Deployment, NotificationError } from '../types';

interface ReportsViewProps {
  clients: Client[];
  deployments: Deployment[];
  errors: NotificationError[];
  onShowToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  clients,
  deployments,
  errors,
  onShowToast,
}) => {
  // Chart Data 1: Version Distribution
  const versionCounts: Record<string, number> = {};
  clients.forEach((c) => {
    c.environments.forEach((e) => {
      if (e.env === 'Production') {
        versionCounts[e.currentVersion] = (versionCounts[e.currentVersion] || 0) + 1;
      }
    });
  });

  const pieData = Object.keys(versionCounts).map((ver) => ({
    name: ver,
    value: versionCounts[ver],
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  // Chart Data 2: Client Health Scores
  const healthData = clients.map((c) => {
    const prod = c.environments.find((e) => e.env === 'Production');
    return {
      name: c.name.split(' ')[0],
      salud: prod ? prod.healthScore : 100,
    };
  });

  // Chart Data 3: Deployment Success Trend
  const monthlyData = [
    { mes: 'Mayo', exitosos: 18, fallidos: 1 },
    { mes: 'Junio', exitosos: 24, fallidos: 2 },
    { mes: 'Julio', exitosos: 28, fallidos: 2 },
    { mes: 'Agosto', exitosos: 5, fallidos: 1 },
  ];

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID Cliente', 'Nombre Cliente', 'SLA', 'Version Produccion', 'Salud %'];
    const rows = clients.map((c) => {
      const prod = c.environments.find((e) => e.env === 'Production');
      return [c.id, c.name, c.slaTier, prod?.currentVersion || 'N/A', prod?.healthScore || 100];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_despliegues_clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('success', 'Reporte Exportado', 'Se ha generado y descargado el archivo CSV corporativo.');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Reportes Detallados & Estado de Implementaciones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Métricas de penetración de versiones, distribución por cliente y análisis de estabilidad de despliegues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Datos CSV</span>
          </button>

          <button
            id="btn-print-pdf"
            onClick={handlePrintPDF}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribution of Production Versions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Distribución de Versiones en Producción</h3>
            <p className="text-xs text-slate-400 mt-0.5">Porcentaje de clientes por cada versión desplegada</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Client Health Index */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Índice de Salud por Cliente (%)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Métrica de estabilidad operacional y SLA</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="salud" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Deployments Success Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Evolución Mensual de Despliegues Exitosos vs Fallidos</h3>
          <p className="text-xs text-slate-400 mt-0.5">Análisis histórico de ejecuciones del pipeline de automatización</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="exitosos" name="Despliegues Exitosos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fallidos" name="Despliegues Fallidos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
