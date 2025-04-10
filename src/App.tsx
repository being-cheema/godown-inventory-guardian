
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DatabaseProvider, useDatabase } from "@/contexts/DatabaseContext";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Alerts from "@/pages/Alerts";
import Inventory from "@/pages/Inventory";
import Suppliers from "@/pages/Suppliers";
import Customers from "@/pages/Customers";
import Orders from "@/pages/Orders";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import LoadingScreen from "@/components/LoadingScreen";
import { useState } from "react";

const App = () => {
  // Move QueryClient inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </DatabaseProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const { isLoading, isError } = useDatabase();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Database Error</h1>
          <p className="text-gray-600 mb-4">
            There was an error initializing the application database.
          </p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;
