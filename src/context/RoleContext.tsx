'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin');

  useEffect(() => {
    const savedRole = localStorage.getItem('lost_found_user_role') as UserRole;
    if (savedRole && ['student', 'teacher', 'admin'].includes(savedRole)) {
      setCurrentRoleState(savedRole);
    }
  }, []);

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem('lost_found_user_role', role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, isAdmin: currentRole === 'admin' }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    return {
      currentRole: 'admin' as UserRole,
      setCurrentRole: () => {},
      isAdmin: true
    };
  }
  return context;
}
