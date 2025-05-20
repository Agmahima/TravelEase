// context/auth-context.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

import { ReactNode } from 'react';
import { User } from '../../../shared/schema';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch or initialize auth state here
    setTimeout(() => {
      setUser({ id: 1, username: 'testuser', password: 'password', email: 'test@example.com', fullName: 'Test User' }); // mock login
      setIsLoading(false);
    }, 1000);
  }, []);
      setUser({ id: 1, username: 'testuser', password: 'password', email: 'test@example.com', fullName: 'Test User' }); // mock login
  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
