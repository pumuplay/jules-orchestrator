"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isTitleAbbreviated: boolean;
  toggleTitle: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTitleAbbreviated, setIsTitleAbbreviated] = useState(false);

  // Persistence (optional, but good for UX)
  useEffect(() => {
    const savedSidebar = localStorage.getItem("sidebar-collapsed");
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === "true");
    }
    const savedTitle = localStorage.getItem("title-abbreviated");
    if (savedTitle !== null) {
      setIsTitleAbbreviated(savedTitle === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", String(newState));
      return newState;
    });
  };

  const toggleTitle = () => {
    setIsTitleAbbreviated((prev) => {
      const newState = !prev;
      localStorage.setItem("title-abbreviated", String(newState));
      return newState;
    });
  };

  return (
    <UIContext.Provider
      value={{
        isSidebarCollapsed,
        toggleSidebar,
        isTitleAbbreviated,
        toggleTitle,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
