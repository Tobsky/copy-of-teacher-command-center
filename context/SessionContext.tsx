import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AcademicSession } from '../types';
import { sessionService } from '../services/sessionService';
import { useAuth } from './AuthContext';

interface SessionContextType {
    academicSessions: AcademicSession[];
    activeSession: AcademicSession | null;
    loading: boolean;

    fetchAcademicSessions: () => Promise<void>;
    addAcademicSession: (session: Omit<AcademicSession, 'id'>) => Promise<void>;
    updateAcademicSession: (session: AcademicSession) => Promise<void>;
    deleteAcademicSession: (id: string) => Promise<void>;
    setActiveSession: (id: string | null) => Promise<void>;
    createSessionFromLegacy: (session: Omit<AcademicSession, 'id'>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [activeSession, setActiveSessionState] = useState<AcademicSession | null>(null);
    const [loading, setLoading] = useState(false);

    // Clear data on logout
    useEffect(() => {
        if (!session) {
            setAcademicSessions([]);
            setActiveSessionState(null);
        } else {
            fetchAcademicSessions();
        }
    }, [session]);

    const fetchAcademicSessions = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await sessionService.fetchAcademicSessions();
            setAcademicSessions(data);

            // Set active session logic
            const active = data.find((s: AcademicSession) => s.isActive);
            if (active) setActiveSessionState(active);
            else if (data.length > 0) {
                // Fallback to first session if none active (or maybe handle this differently?)
                // The original AppContext logic did this:
                setActiveSessionState(data[0]);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const addAcademicSession = async (newSession: Omit<AcademicSession, 'id'>) => {
        if (!session) return;
        try {
            const created = await sessionService.addAcademicSession(newSession, session.user.id);
            setAcademicSessions(prev => [created, ...prev]);
            if (created.isActive) setActiveSessionState(created);
        } catch (error) { console.error(error); }
    };

    const updateAcademicSession = async (updated: AcademicSession) => {
        try {
            const result = await sessionService.updateAcademicSession(updated);
            setAcademicSessions(prev => prev.map(s => s.id === result.id ? result : s));
            if (result.isActive) setActiveSessionState(result);
        } catch (error) { console.error(error); }
    };

    const deleteAcademicSession = async (id: string) => {
        try {
            await sessionService.deleteAcademicSession(id);
            setAcademicSessions(prev => prev.filter(s => s.id !== id));
            if (activeSession?.id === id) setActiveSessionState(null);
        } catch (error) { console.error(error); }
    };

    const setActiveSession = async (id: string | null) => {
        if (!session) return;
        try {
            const newActive = await sessionService.setActiveSession(id, session.user.id);
            if (id === null) {
                setActiveSessionState(null);
            } else if (newActive) {
                setActiveSessionState(newActive);
            }
            // Re-fetch to ensure all session "isActive" flags are correct in the list?
            // Or just update locallly. The original code called fetchAcademicSessions.
            fetchAcademicSessions();
        } catch (error) { console.error(error); }
    };

    const createSessionFromLegacy = async (newSession: Omit<AcademicSession, 'id'>) => {
        if (!session) return;
        try {
            const createdSession = await sessionService.createSessionFromLegacy(newSession, session.user.id);
            setAcademicSessions(prev => [createdSession, ...prev]);
            if (createdSession.isActive) setActiveSessionState(createdSession);
        } catch (error) { console.error("Error creating session:", error); }
    };

    return (
        <SessionContext.Provider value={{
            academicSessions,
            activeSession,
            loading,
            fetchAcademicSessions,
            addAcademicSession,
            updateAcademicSession,
            deleteAcademicSession,
            setActiveSession,
            createSessionFromLegacy
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within SessionProvider");
    return context;
};
