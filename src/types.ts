export type UserRole = 'Admin' | 'Manager' | 'Developer' | 'Auditor';

export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface UserPermissions {
  manageUsers: boolean;
  deployToProduction: boolean;
  approveReleases: boolean;
  manageClients: boolean;
  viewReports: boolean;
  resolveErrors: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  authMethod: 'local' | 'oauth_google' | 'oauth_github';
  department: string;
  lastLogin: string;
  permissions: UserPermissions;
}

export type EnvironmentType = 'Production' | 'Staging' | 'QA' | 'Dev';

export type DeploymentStatus = 'Success' | 'In_Progress' | 'Scheduled' | 'Failed' | 'Rolled_Back';

export interface ClientEnvironment {
  env: EnvironmentType;
  currentVersion: string;
  targetVersion: string;
  status: DeploymentStatus;
  lastDeployedAt: string;
  healthScore: number; // 0-100
  activeErrorsCount: number;
}

export interface Client {
  id: string;
  name: string;
  code: string; // e.g. "SAN-01"
  logo?: string;
  sector: string;
  contactEmail: string;
  slaTier: 'Platinum' | 'Gold' | 'Silver';
  environments: ClientEnvironment[];
  notes?: string;
}

export interface Deployment {
  id: string;
  clientId: string;
  clientName: string;
  environment: EnvironmentType;
  version: string;
  previousVersion: string;
  deployedBy: string;
  deployedByEmail: string;
  deployedAt: string;
  scheduledFor?: string;
  status: DeploymentStatus;
  durationSeconds?: number;
  commitHash: string;
  releaseNotesSummary: string;
  failureReason?: string;
}

export type ChangelogCategory = 'Feature' | 'Bugfix' | 'Security' | 'Performance' | 'Breaking';

export interface ChangelogItem {
  id: string;
  version: string;
  releaseDate: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  author: string;
  affectedClients: string[]; // Client IDs or 'ALL'
  pullRequestUrl?: string;
}

export type ErrorSeverity = 'Critical' | 'Warning' | 'Info';
export type ErrorStatus = 'Active' | 'Investigating' | 'Resolved' | 'Ignored';

export interface NotificationError {
  id: string;
  title: string;
  message: string;
  code: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  clientId?: string;
  clientName?: string;
  environment?: EnvironmentType;
  affectedVersion?: string;
  timestamp: string;
  stackTrace?: string;
  aiDiagnosis?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SystemMetrics {
  totalClients: number;
  clientsOnLatestVersionPercentage: number;
  successfulDeploymentsMonth: number;
  failedDeploymentsMonth: number;
  activeErrorsCount: number;
  averageDeploymentTimeMinutes: number;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
