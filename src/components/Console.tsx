
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Maximize2, Minimize2, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runInventoryTests } from '@/lib/queryUtils';

const Console: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Override console.log to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;
    const originalConsoleGroup = console.group;
    const originalConsoleGroupEnd = console.groupEnd;
    
    let groupLevel = 0;
    
    const addLog = (type: string, ...args: any[]) => {
      const indent = '  '.repeat(groupLevel);
      const log = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      setLogs(prevLogs => [...prevLogs, `${type === 'log' ? '' : `[${type}] `}${indent}${log}`]);
    };
    
    console.log = (...args) => {
      originalConsoleLog(...args);
      addLog('log', ...args);
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      addLog('error', ...args);
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      addLog('warn', ...args);
    };
    
    console.info = (...args) => {
      originalConsoleInfo(...args);
      addLog('info', ...args);
    };
    
    console.group = (...args) => {
      originalConsoleGroup(...args);
      addLog('group', ...args);
      groupLevel++;
    };
    
    console.groupEnd = () => {
      originalConsoleGroupEnd();
      if (groupLevel > 0) groupLevel--;
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
      console.group = originalConsoleGroup;
      console.groupEnd = originalConsoleGroupEnd;
    };
  }, []);
  
  // Scroll to bottom when logs update
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  
  const handleRunTests = () => {
    setLogs([]);
    runInventoryTests();
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };
  
  const handleClear = () => {
    setLogs([]);
  };
  
  if (!isOpen && !isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Terminal className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex space-x-2">
          <Button variant="outline" className="rounded-full" onClick={handleRunTests}>
            <Play className="h-4 w-4" />
          </Button>
          <Button
            className="rounded-full shadow-lg flex items-center justify-center"
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
          >
            <Terminal className="h-4 w-4 mr-2" />
            <span>Console</span>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-2/3 lg:w-1/2 h-1/2 z-50 p-4">
      <Card className="h-full flex flex-col">
        <CardHeader className="p-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Inventory System Console
          </CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={handleRunTests}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex-grow">
          <div 
            ref={consoleRef}
            className="h-full overflow-auto bg-black text-green-500 p-4 font-mono text-sm"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">
                Click the play button to run inventory tests and see the results here.
              </div>
            ) : (
              logs.map((log, index) => {
                // Handle JSON strings to display them properly
                if (log.startsWith('{') || log.startsWith('[')) {
                  try {
                    const jsonObj = JSON.parse(log);
                    return (
                      <pre key={index} className="mb-1 whitespace-pre-wrap break-words">
                        {JSON.stringify(jsonObj, null, 2)}
                      </pre>
                    );
                  } catch {
                    // If it's not valid JSON, display as normal
                    return <div key={index} className="mb-1 whitespace-pre-wrap break-words">{log}</div>;
                  }
                }
                
                // Display regular logs
                return <div key={index} className="mb-1 whitespace-pre-wrap break-words">{log}</div>;
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;
