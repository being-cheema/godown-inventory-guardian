
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initDatabase } from '@/lib/database';

interface DatabaseContextType {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDatabase = async () => {
      console.group("Database Initialization");
      console.info("Starting database initialization...");
      
      try {
        await initDatabase();
        console.info("Database initialized successfully");
        console.info("Database schema created with proper relationships:");
        console.info("- Products linked to Suppliers (supplier_id foreign key)");
        console.info("- Inventory records linked to Products, Warehouses, and Suppliers");
        console.info("- Orders linked to Customers");
        console.info("- Order Items linked to Orders and Products");
        console.info("Sample data loaded into the database");
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setIsError(true);
        setError(err as Error);
        setIsLoading(false);
      }
      
      console.groupEnd();
    };

    loadDatabase();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isLoading, isError, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
