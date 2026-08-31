import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_DEPLOYMENTS,
  INITIAL_CHANGELOGS,
  INITIAL_ERRORS,
} from './src/data/mockData';
import { User, Client, Deployment, ChangelogItem, NotificationError, UserRole, EnvironmentType, DeploymentStatus } from './src/types';

// ESM directory name resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store initialized from seed data
let users: User[] = [...INITIAL_USERS];
let clients: Client[] = [...INITIAL_CLIENTS];
let deployments: Deployment[] = [...INITIAL_DEPLOYMENTS];
let changelogs: ChangelogItem[] = [...INITIAL_CHANGELOGS];
let errorsList: NotificationError[] = [...INITIAL_ERRORS];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & OAUTH ENDPOINTS
  // -------------------------------------------------------------

  // Local login handler
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    
    // Check if user exists or create a preset user
    let user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
    
    if (!user && email) {
      // Auto-register for custom entered emails
      const assignedRole: UserRole = role || 'Developer';
      user = {
        id: `u-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()),
        email: email,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
        role: assignedRole,
        status: 'Active',
        authMethod: 'local',
        department: 'Operaciones TI',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        permissions: {
          manageUsers: assignedRole === 'Admin',
          deployToProduction: assignedRole === 'Admin' || assignedRole === 'Manager',
          approveReleases: assignedRole === 'Admin' || assignedRole === 'Manager',
          manageClients: assignedRole === 'Admin' || assignedRole === 'Manager',
          viewReports: true,
          resolveErrors: assignedRole !== 'Auditor',
        },
      };
      users.push(user);
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const token = `token_corporate_${user.id}_${Date.now()}`;
    res.json({
      user,
      token,
      message: 'Autenticación exitosa',
    });
  });

  // OAuth Authorization URL endpoint (Compliant with AI Studio Popup OAuth skill)
  app.get('/api/auth/url', (req, res) => {
    const provider = (req.query.provider as string) || 'google';
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/callback`;

    // Constructs provider URL or falls back to internal popup callback for demo/sandbox mode
    let authUrl = '';

    if (provider === 'google') {
      const googleClientId = process.env.GOOGLE_CLIENT_ID || 'DEMO_GOOGLE_CLIENT_ID';
      const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: `provider=google`,
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else if (provider === 'github') {
      const githubClientId = process.env.GITHUB_CLIENT_ID || 'DEMO_GITHUB_CLIENT_ID';
      const params = new URLSearchParams({
        client_id: githubClientId,
        redirect_uri: redirectUri,
        scope: 'read:user user:email',
        state: `provider=github`,
      });
      authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    } else {
      // Direct corporate SSO popup URL
      authUrl = `${redirectUri}?demo_provider=${provider}&code=demo_sso_code_${Date.now()}`;
    }

    res.json({ url: authUrl, redirectUri });
  });

  // OAuth Callback Handler with postMessage HTML response
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    const provider = (req.query.state as string)?.includes('github')
      ? 'github'
      : (req.query.demo_provider as string) || 'google';

    const mockOAuthUser: User = {
      id: `u-oauth-${Date.now()}`,
      name: provider === 'github' ? 'Octocat Dev' : 'Usuario Google Workspace',
      email: provider === 'github' ? 'dev.octo@github.com' : 'workspace.user@enterprise-corp.com',
      avatar: provider === 'github'
        ? 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=250'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
      role: 'Developer',
      status: 'Active',
      authMethod: provider === 'github' ? 'oauth_github' : 'oauth_google',
      department: 'Ingeniería Cloud & SSO',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      permissions: {
        manageUsers: false,
        deployToProduction: true,
        approveReleases: false,
        manageClients: true,
        viewReports: true,
        resolveErrors: true,
      },
    };

    // Store OAuth user if not exists
    const existing = users.find((u) => u.email === mockOAuthUser.email);
    const authUser = existing || mockOAuthUser;
    if (!existing) {
      users.push(authUser);
    } else {
      authUser.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }

    const token = `token_oauth_${authUser.id}_${Date.now()}`;

    // Send postMessage to opener and close popup
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticación Exitosa</title>
          <style>
            body { font-family: system-ui, sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 360px; }
            .spinner { width: 32px; height: 32px; border: 3px solid #38bdf8; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 1rem auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Autenticación Exitosa</h2>
            <p>Iniciando sesión en el Portal Corporativo...</p>
            <div class="spinner"></div>
          </div>
          <script>
            const authPayload = {
              type: 'OAUTH_AUTH_SUCCESS',
              user: ${JSON.stringify(authUser)},
              token: "${token}"
            };
            if (window.opener) {
              window.opener.postMessage(authPayload, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  });

  // -------------------------------------------------------------
  // 2. CLIENTS & VERSIONS API
  // -------------------------------------------------------------

  app.get('/api/clients', (req, res) => {
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: req.body.name,
      code: req.body.code || `CLI-${clients.length + 1}`,
      sector: req.body.sector || 'General',
      contactEmail: req.body.contactEmail || 'admin@client.com',
      slaTier: req.body.slaTier || 'Gold',
      environments: [
        {
          env: 'Production',
          currentVersion: 'v3.5.0',
          targetVersion: 'v3.5.2',
          status: 'Success',
          lastDeployedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          healthScore: 100,
          activeErrorsCount: 0,
        },
        {
          env: 'Staging',
          currentVersion: 'v3.5.2',
          targetVersion: 'v3.5.2',
          status: 'Success',
          lastDeployedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          healthScore: 100,
          activeErrorsCount: 0,
        },
      ],
      notes: req.body.notes || '',
    };
    clients.push(newClient);
    res.status(201).json(newClient);
  });

  // Upgrade or rollback version endpoint
  app.post('/api/clients/:id/upgrade', (req, res) => {
    const { id } = req.params;
    const { env, targetVersion, deployedBy } = req.body;

    const client = clients.find((c) => c.id === id);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    const clientEnv = client.environments.find((e) => e.env === env);
    if (!clientEnv) return res.status(404).json({ error: 'Ambiente no encontrado' });

    const previousVersion = clientEnv.currentVersion;
    clientEnv.status = 'In_Progress';
    clientEnv.targetVersion = targetVersion;

    // Record deployment entry
    const newDeployment: Deployment = {
      id: `dep-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      environment: env as EnvironmentType,
      version: targetVersion,
      previousVersion: previousVersion,
      deployedBy: deployedBy || 'Operador de Sistema',
      deployedByEmail: 'operaciones@enterprise.com',
      deployedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'In_Progress',
      commitHash: Math.random().toString(36).substring(2, 9),
      releaseNotesSummary: `Actualización ejecutada a la versión ${targetVersion} para ${client.name} en ${env}.`,
    };

    deployments.unshift(newDeployment);

    // Simulate completion after short delay in memory
    setTimeout(() => {
      // 90% chance of success, 10% chance of simulated error to test auto-notifications
      const isSuccess = req.body.simulateFailure ? false : true;
      if (isSuccess) {
        clientEnv.currentVersion = targetVersion;
        clientEnv.status = 'Success';
        newDeployment.status = 'Success';
        newDeployment.durationSeconds = Math.floor(Math.random() * 180) + 60;
      } else {
        clientEnv.status = 'Failed';
        clientEnv.activeErrorsCount += 1;
        clientEnv.healthScore = Math.max(60, clientEnv.healthScore - 20);
        newDeployment.status = 'Failed';
        newDeployment.failureReason = `Falla en scripts de pos-despliegue en ${env}`;

        // Create automatic error notification
        const autoError: NotificationError = {
          id: `err-auto-${Date.now()}`,
          title: `Falla Automática en Despliegue ${targetVersion}`,
          message: `El proceso de despliegue para el cliente ${client.name} en ${env} falló inesperadamente durante la migración de esquemas.`,
          code: 'ERR_DEPLOYMENT_PIPELINE_FAILED',
          severity: 'Critical',
          status: 'Active',
          clientId: client.id,
          clientName: client.name,
          environment: env as EnvironmentType,
          affectedVersion: targetVersion,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19).replace('T', ' '),
          stackTrace: `DeploymentExecutionError: Subprocess exited with code 1 in step 'apply_migrations'
    at PipelineRunner.executeStage (Pipeline.ts:94)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`,
          aiDiagnosis: 'Diagnóstico de Alerta: Conflicto de llaves foráneas detectado. Se recomienda ejecutar rollback o aplicar el script de parche de esquema v3.5.2-fix.sql.',
        };
        errorsList.unshift(autoError);
      }
    }, 2500);

    res.json({ client, deployment: newDeployment });
  });

  // -------------------------------------------------------------
  // 3. DEPLOYMENTS & CHANGELOGS API
  // -------------------------------------------------------------

  app.get('/api/deployments', (req, res) => {
    res.json(deployments);
  });

  app.get('/api/changelogs', (req, res) => {
    res.json(changelogs);
  });

  app.post('/api/changelogs', (req, res) => {
    const newChangelog: ChangelogItem = {
      id: `cl-${Date.now()}`,
      version: req.body.version,
      releaseDate: new Date().toISOString().split('T')[0],
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'Feature',
      author: req.body.author || 'Equipo DevOps',
      affectedClients: req.body.affectedClients || ['ALL'],
      pullRequestUrl: req.body.pullRequestUrl,
    };
    changelogs.unshift(newChangelog);
    res.status(201).json(newChangelog);
  });

  // -------------------------------------------------------------
  // 4. ADMIN USERS & PERMISSIONS API
  // -------------------------------------------------------------

  app.get('/api/admin/users', (req, res) => {
    res.json(users);
  });

  app.put('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

    users[userIndex] = {
      ...users[userIndex],
      ...req.body,
    };

    res.json(users[userIndex]);
  });

  app.post('/api/admin/users', (req, res) => {
    const role: UserRole = req.body.role || 'Developer';
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      role: role,
      status: req.body.status || 'Active',
      authMethod: 'local',
      department: req.body.department || 'Operaciones',
      lastLogin: 'Nunca',
      permissions: req.body.permissions || {
        manageUsers: role === 'Admin',
        deployToProduction: role === 'Admin' || role === 'Manager',
        approveReleases: role === 'Admin' || role === 'Manager',
        manageClients: role === 'Admin' || role === 'Manager',
        viewReports: true,
        resolveErrors: role !== 'Auditor',
      },
    };
    users.push(newUser);
    res.status(201).json(newUser);
  });

  // -------------------------------------------------------------
  // 5. ERRORS & NOTIFICATIONS API
  // -------------------------------------------------------------

  app.get('/api/errors', (req, res) => {
    res.json(errorsList);
  });

  // Trigger test error incident for instant automatic error notification demo
  app.post('/api/errors/trigger', (req, res) => {
    const { title, message, severity, clientId } = req.body;
    const client = clients.find((c) => c.id === clientId) || clients[0];

    const newError: NotificationError = {
      id: `err-trig-${Date.now()}`,
      title: title || 'Falla Crítica de Conexión en Microservicio de Pagos',
      message: message || 'Timeout de respuesta (>5000ms) al conectar con la pasarela de pagos del cliente.',
      code: 'ERR_GATEWAY_TIMEOUT_504',
      severity: severity || 'Critical',
      status: 'Active',
      clientId: client.id,
      clientName: client.name,
      environment: 'Production',
      affectedVersion: client.environments[0]?.currentVersion || 'v3.5.2',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      stackTrace: `GatewayTimeoutException: Remote server failed to respond within threshold [5000ms]
    at PaymentGatewayClient.processTransaction (PaymentGateway.ts:118)
    at async OrderService.checkout (OrderService.ts:45)`,
      aiDiagnosis: 'Diagnóstico Automático IA: Posible degradación del servicio de red de la pasarela bancaria externa o agotamiento del pool de conexiones HTTP en la instancia de producción.',
    };

    errorsList.unshift(newError);
    res.status(201).json(newError);
  });

  // Update error status (e.g. resolve or investigate)
  app.put('/api/errors/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, resolvedBy } = req.body;

    const errorItem = errorsList.find((e) => e.id === id);
    if (!errorItem) return res.status(404).json({ error: 'Error no encontrado' });

    errorItem.status = status;
    if (status === 'Resolved') {
      errorItem.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      errorItem.resolvedBy = resolvedBy || 'Administrador';
    }

    res.json(errorItem);
  });

  // -------------------------------------------------------------
  // 6. GEMINI AI DIAGNOSIS & RELEASE NOTES ENDPOINT
  // -------------------------------------------------------------

  app.post('/api/ai/diagnose', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { errorMessage, stackTrace, clientName, version } = req.body;

      if (!apiKey) {
        // High quality fallback analysis if GEMINI_API_KEY is not configured
        return res.json({
          diagnosis: `Análisis Estándar de Sistema:\n\n1. Causa Raíz Probable: Error de timeout en bloqueos de tabla o falta de índices en ${version} para ${clientName}.\n2. Pasos Recomendados:\n   - Verificar el consumo de CPU e IOPS en la base de datos SQL.\n   - Ejecutar la migración en lotes (batching) usando scripts sin bloqueo exclusivo.\n   - Aplicar el procedimiento de rollback si la degradación supera los 5 minutos.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Eres un Ingeniero Principal DevOps y experto en fiabilidad de sistemas (SRE).
Analiza el siguiente fallo detectado en una aplicación corporativa y proporciona un diagnóstico conciso en español con:
- Causa raíz probable.
- Impacto estimado.
- 3 acciones correctivas inmediatas.

Cliente: ${clientName || 'General'}
Versión Afectada: ${version || 'v3.5.2'}
Mensaje de Error: ${errorMessage}
Stack Trace: ${stackTrace || 'N/A'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ diagnosis: response.text });
    } catch (err: any) {
      console.error('Error generating AI diagnosis:', err);
      res.status(500).json({
        diagnosis: 'Error al contactar la IA. Verifique su conexión y la clave GEMINI_API_KEY.',
      });
    }
  });

  app.post('/api/ai/release-notes', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { features, version } = req.body;

      if (!apiKey) {
        return res.json({
          notes: `Notas de Lanzamiento ${version || 'v3.6.0'}:\n\n✨ Novedades:\n- ${features || 'Mejoras generales de rendimiento y seguridad.'}\n\n🔒 Seguridad y Estabilidad:\n- Parches acumulativos para alta disponibilidad.\n- Validación estricta de payloads en API corporativas.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Redacta unas notas de lanzamiento (Release Notes) corporativas, profesionales y elegantes en español para la versión ${version || 'v3.6.0'}.
Características/Cambios incluidos: ${features}
Estructura el resultado con títulos claros, emojis sutiles y viñetas descriptivas para clientes ejecutivos.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ notes: response.text });
    } catch (err: any) {
      res.status(500).json({ error: 'Fallo al generar Release Notes con IA.' });
    }
  });

  // -------------------------------------------------------------
  // 7. VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Corporate Portal Server] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer();
