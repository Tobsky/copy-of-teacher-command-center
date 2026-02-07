import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppView } from '../types';

interface UIContextType {
    currentView: AppView;
    setCurrentView: (view: AppView) => void;
    // Future: Theme, Sidebar, Modals
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

    return (
        <UIContext.Provider value={{ currentView, setCurrentView }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error("useUI must be used within UIProvider");
    return context;
};
