import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type UserRole = 'user' | 'admin' | 'it_guy';
export type TechnicianStatus = 'unoccupied' | 'occupied' | 'absent';
export type RequestStatus =
  | 'pending_admin'
  | 'assigned'
  | 'in_progress'
  | 'completed_by_it'
  | 'session_terminated';
export type RequestUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'it_guy';
  department: string;
  building: string;
  floor: string;
  room: string;
  phone: string;
  avatarUrl: string;
  technicianId?: string | null;
}

export interface ITGuy {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleTitle: string;
  department: string;
  status: TechnicianStatus;
  currentRequestId: string | null;
  currentRoundAssignments: number;
  lifetimeAssignments: number;
  totalCompletedJobs: number;
  lastAssignedAt: string | null;
  rating: number;
  ratingsCount: number;
  isOnline: boolean;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterDept: string;
  requesterPhone: string;
  locationBuilding: string;
  locationFloor: string;
  locationRoom: string;
  title: string;
  description: string;
  category: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  assignedTechnicianPhone: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  terminatedAt: string | null;
  resolutionNotes: string | null;
  userRating: number | null;
  userFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RankedITGuy {
  technicianId: string;
  name: string;
  avatarUrl: string;
  phone: string;
  roleTitle: string;
  department: string;
  status: TechnicianStatus;
  oddsPercentage: number;
  priorityScore: number;
  isHighestOdds: boolean;
  rank: number;
  idleMinutes: number;
  idleMinutesFormatted: string;
  explanation: string;
  hasBeenAssignedInRound: boolean;
  rating: number;
  completedJobs: number;
}

export interface OddsCalculationResult {
  roundNumber: number;
  totalUnoccupied: number;
  totalTechnicians: number;
  totalAssignedInRound: number;
  candidates: RankedITGuy[];
}

export interface AppNotification {
  id: string;
  recipientType: 'user' | 'it_guy' | 'admin' | 'all';
  recipientId: string;
  title: string;
  message: string;
  type: 'dispatch' | 'status_update' | 'completion' | 'termination' | 'alert';
  requestId: string | null;
  ticketNumber: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  requestId: string | null;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: string;
  urgency: RequestUrgency;
  requesterId?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterDept?: string;
  requesterPhone?: string;
  locationBuilding: string;
  locationFloor: string;
  locationRoom: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'it_guy'; // Admin cannot be chosen!
  department: string;
  phone: string;
  building: string;
  floor: string;
  room: string;
  roleTitle?: string;
}

// Authentication API
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user: UserProfile; technician: ITGuy | null }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<{ success: boolean; user: UserProfile; technician: ITGuy | null }> {
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function fetchCurrentUser(
  userId: string,
): Promise<{ user: UserProfile; technician: ITGuy | null }> {
  const res = await api.get('/auth/me', { params: { userId } });
  return res.data;
}

// Operational APIs
export async function checkBackendHealth() {
  const res = await api.get('/health');
  return res.data;
}

export async function fetchTechnicians(): Promise<ITGuy[]> {
  const res = await api.get('/technicians');
  return res.data;
}

export async function fetchTechnician(id: string): Promise<ITGuy> {
  const res = await api.get(`/technicians/${id}`);
  return res.data;
}

export async function updateTechnicianAttendance(
  id: string,
  status: 'unoccupied' | 'absent',
  adminName = 'Alex Mercer (Admin)',
): Promise<ITGuy> {
  const res = await api.patch(`/technicians/${id}/attendance`, { status, adminName });
  return res.data;
}

export async function fetchRequests(filters?: {
  status?: string;
  requesterId?: string;
  technicianId?: string;
}): Promise<ServiceRequest[]> {
  const res = await api.get('/requests', { params: filters });
  return res.data;
}

export async function createServiceRequest(payload: CreateRequestPayload): Promise<ServiceRequest> {
  const res = await api.post('/requests', payload);
  return res.data;
}

export async function fetchOdds(): Promise<OddsCalculationResult> {
  const res = await api.get('/dispatch/odds');
  return res.data;
}

export async function assignTechnicianToTicket(
  requestId: string,
  technicianId: string,
  adminName = 'Alex Mercer (Admin)',
): Promise<{ success: boolean; message: string; request: ServiceRequest; roundNumber: number }> {
  const res = await api.post('/dispatch/assign', { requestId, technicianId, adminName });
  return res.data;
}

export async function startServiceTask(requestId: string): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${requestId}/start`);
  return res.data;
}

export async function completeServiceTask(
  requestId: string,
  resolutionNotes: string,
): Promise<ServiceRequest> {
  const res = await api.post(`/requests/${requestId}/complete`, { resolutionNotes });
  return res.data;
}

export async function terminateServiceSession(
  requestId: string,
  rating: number,
  feedback?: string,
): Promise<{ request: ServiceRequest; technician: ITGuy | null }> {
  const res = await api.post(`/requests/${requestId}/terminate`, { rating, feedback });
  return res.data;
}

export async function fetchNotifications(
  recipientId?: string,
  recipientType?: string,
): Promise<AppNotification[]> {
  const res = await api.get('/notifications', { params: { recipientId, recipientType } });
  return res.data;
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead(recipientId?: string): Promise<{ success: boolean }> {
  const res = await api.post('/notifications/read-all', { recipientId });
  return res.data;
}

export async function fetchAuditLogs(limit = 50): Promise<AuditLog[]> {
  const res = await api.get('/audit-logs', { params: { limit } });
  return res.data;
}
