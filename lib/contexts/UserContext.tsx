'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  userType: 'buyer' | 'supplier';
}

interface IUserContext {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider');
  }
  return ctx;
};

export { UserContext };
