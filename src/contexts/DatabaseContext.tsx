
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initDatabase } from '@/lib/database';

interface DatabaseContextType {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refreshData: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    console.log("Manually triggering data refresh...");
    setRefreshTrigger(prev => prev + 1);
  };

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
        console.info("Sample data loaded into the database (20+ products, 6 suppliers, 5 warehouses)");
        
        // Log the actual relationships in the database
        console.info("Database relationships:");
        console.info("- Supplier → Products: One-to-many relationship");
        console.info("- Supplier → Inventory Records: One-to-many relationship");
        console.info("- Product → Inventory Records: One-to-many relationship");
        console.info("- Warehouse → Inventory Records: One-to-many relationship");
        console.info("- Customer → Orders: One-to-many relationship");
        console.info("- Order → Order Items: One-to-many relationship");
        console.info("- Product → Order Items: One-to-many relationship");
        
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
  }, [refreshTrigger]);

  return (
    <DatabaseContext.Provider value={{ isLoading, isError, error, refreshData }}>
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
