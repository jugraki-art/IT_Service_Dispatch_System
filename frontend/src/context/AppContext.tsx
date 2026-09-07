import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  type TechnicianStatus,
  type UserProfile,
  type ITGuy,
  type ServiceRequest,
  type OddsCalculationResult,
  type AppNotification,
  type AuditLog,
  type CreateRequestPayload,
  type RegisterPayload,
  fetchTechnicians,
  fetchRequests,
  fetchOdds,
  fetchNotifications,
  fetchAuditLogs,
  createServiceRequest,
  assignTechnicianToTicket,
  startServiceTask,
  completeServiceTask,
  terminateServiceSession,
  updateTechnicianAttendance,
  markNotificationRead,
  markAllNotificationsRead,
  loginUser,
  registerUser,
} from '../services/api';
import { sound } from '../utils/sound';

interface AppContextType {
  currentUser: UserProfile | null;
  currentITGuy: ITGuy | null;
  technicians: ITGuy[];
  requests: ServiceRequest[];
  odds: OddsCalculationResult | null;
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  loading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  unreadCount: number;
  isNotifDrawerOpen: boolean;
  setIsNotifDrawerOpen: (open: boolean) => void;
  dispatchModalTicket: ServiceRequest | null;
  setDispatchModalTicket: (ticket: ServiceRequest | null) => void;
  terminationModalTicket: ServiceRequest | null;
  setTerminationModalTicket: (ticket: ServiceRequest | null) => void;

  // Authentication Actions
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;

  // Operational Actions
  refreshAll: () => Promise<void>;
  createRequest: (payload: CreateRequestPayload) => Promise<ServiceRequest>;
  dispatchTechnician: (requestId: string, technicianId: string) => Promise<void>;
  startService: (requestId: string) => Promise<void>;
  completeService: (requestId: string, notes: string) => Promise<void>;
  terminateSession: (requestId: string, rating: number, feedback?: string) => Promise<void>;
  toggleAttendance: (technicianId: string, status: TechnicianStatus) => Promise<void>;
  markNotifRead: (id: string) => Promise<void>;
  markAllNotifsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read authenticated user from localStorage if present
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('dispatch_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentITGuy, setCurrentITGuy] = useState<ITGuy | null>(() => {
    try {
      const saved = localStorage.getItem('dispatch_auth_tech');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [technicians, setTechnicians] = useState<ITGuy[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [odds, setOdds] = useState<OddsCalculationResult | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [dispatchModalTicket, setDispatchModalTicket] = useState<ServiceRequest | null>(null);
  const [terminationModalTicket, setTerminationModalTicket] = useState<ServiceRequest | null>(null);

  const setSoundEnabled = (enabled: boolean) => {
    sound.enabled = enabled;
    setSoundEnabledState(enabled);
  };

  const refreshAll = useCallback(async () => {
    try {
      const [techsData, reqsData, oddsData, notifsData, auditData] = await Promise.all([
        fetchTechnicians(),
        fetchRequests(),
        fetchOdds(),
        fetchNotifications(currentUser?.id, currentUser?.role),
        fetchAuditLogs(),
      ]);

      setTechnicians(techsData);
      setRequests(reqsData);
      setOdds(oddsData);
      setNotifications(notifsData);
      setAuditLogs(auditData);

      // Keep currentITGuy in sync with technicians list if logged in as it_guy
      if (currentUser?.role === 'it_guy') {
        const matchingTech = techsData.find(
          (t) =>
            t.id === currentUser.technicianId ||
            t.email.toLowerCase() === currentUser.email.toLowerCase(),
        );
        if (matchingTech) {
          setCurrentITGuy(matchingTech);
          localStorage.setItem('dispatch_auth_tech', JSON.stringify(matchingTech));
        }
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Polling every 3.5 seconds
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 3500);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    setCurrentUser(res.user);
    setCurrentITGuy(res.technician);
    localStorage.setItem('dispatch_auth_user', JSON.stringify(res.user));
    if (res.technician) {
      localStorage.setItem('dispatch_auth_tech', JSON.stringify(res.technician));
    } else {
      localStorage.removeItem('dispatch_auth_tech');
    }
    sound.playSuccessChime();
    await refreshAll();
  };

  const register = async (payload: RegisterPayload) => {
    const res = await registerUser(payload);
    setCurrentUser(res.user);
    setCurrentITGuy(res.technician);
    localStorage.setItem('dispatch_auth_user', JSON.stringify(res.user));
    if (res.technician) {
      localStorage.setItem('dispatch_auth_tech', JSON.stringify(res.technician));
    } else {
      localStorage.removeItem('dispatch_auth_tech');
    }
    sound.playSuccessChime();
    await refreshAll();
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentITGuy(null);
    localStorage.removeItem('dispatch_auth_user');
    localStorage.removeItem('dispatch_auth_tech');
  };

  const createRequest = async (payload: CreateRequestPayload): Promise<ServiceRequest> => {
    if (!currentUser) throw new Error('Not logged in');
    const fullPayload: CreateRequestPayload = {
      ...payload,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requesterDept: currentUser.department,
      requesterPhone: currentUser.phone,
    };

    const req = await createServiceRequest(fullPayload);
    sound.playAlertTone();
    await refreshAll();
    return req;
  };

  const dispatchTechnician = async (requestId: string, technicianId: string) => {
    await assignTechnicianToTicket(
      requestId,
      technicianId,
      currentUser?.name || 'Administrator',
    );
    sound.playDispatchChime();
    setDispatchModalTicket(null);
    await refreshAll();
  };

  const startService = async (requestId: string) => {
    await startServiceTask(requestId);
    sound.playAlertTone();
    await refreshAll();
  };

  const completeService = async (requestId: string, notes: string) => {
    await completeServiceTask(requestId, notes);
    sound.playAlertTone();
    await refreshAll();
  };

  const terminateSession = async (requestId: string, rating: number, feedback?: string) => {
    await terminateServiceSession(requestId, rating, feedback);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    sound.playSuccessChime();
    setTerminationModalTicket(null);
    await refreshAll();
  };

  const toggleAttendance = async (technicianId: string, status: TechnicianStatus) => {
    if (status === 'occupied') return;
    await updateTechnicianAttendance(
      technicianId,
      status,
      currentUser?.name || 'Administrator',
    );
    await refreshAll();
  };

  const markNotifRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotifsRead = async () => {
    await markAllNotificationsRead(currentUser?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentITGuy,
        technicians,
        requests,
        odds,
        notifications,
        auditLogs,
        loading,
        soundEnabled,
        setSoundEnabled,
        unreadCount,
        isNotifDrawerOpen,
        setIsNotifDrawerOpen,
        dispatchModalTicket,
        setDispatchModalTicket,
        terminationModalTicket,
        setTerminationModalTicket,
        login,
        register,
        logout,
        refreshAll,
        createRequest,
        dispatchTechnician,
        startService,
        completeService,
        terminateSession,
        toggleAttendance,
        markNotifRead,
        markAllNotifsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
