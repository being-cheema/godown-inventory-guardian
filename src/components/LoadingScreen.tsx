
import React from 'react';
import { Warehouse } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Warehouse className="h-16 w-16 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Godown Inventory Guardian</h1>
        <p className="text-gray-600 mb-4">Initializing database...</p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loadingBar_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
