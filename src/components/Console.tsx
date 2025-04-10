
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Maximize2, Minimize2, Play, X, RotateCcw, Save, FileCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runInventoryTests } from '@/lib/queryUtils';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const Console: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isVerbose, setIsVerbose] = useState(true);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
      
      const timestamp = new Date().toISOString().substring(11, 23);
      const logWithTimestamp = `[${timestamp}] ${type === 'log' ? '' : `[${type}] `}${indent}${log}`;
      
      setLogs(prevLogs => [...prevLogs, logWithTimestamp]);
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
    if (consoleRef.current && isAutoScroll) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);
  
  const handleRunTests = () => {
    setLogs(prevLogs => [
      ...prevLogs, 
      `[${new Date().toISOString().substring(11, 23)}] === Starting Inventory Tests ===`
    ]);
    
    console.group("Inventory System Tests");
    runInventoryTests(isVerbose);
    console.groupEnd();
    
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
    
    toast({
      title: "Tests Running",
      description: "Inventory tests have been initiated"
    });
  };
  
  const handleClear = () => {
    setLogs([]);
    toast({
      title: "Console Cleared",
      description: "All console logs have been cleared"
    });
  };
  
  const handleSave = () => {
    try {
      const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Logs Saved",
        description: "Console logs have been saved to a file"
      });
    } catch (error) {
      console.error("Error saving logs:", error);
      toast({
        title: "Error",
        description: "Failed to save console logs",
        variant: "destructive"
      });
    }
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
          <Button variant="outline" className="rounded-full shadow-lg flex items-center justify-center" onClick={handleRunTests}>
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
      <Card className="h-full flex flex-col animate-fade-in shadow-xl">
        <CardHeader className="p-3 border-b flex-shrink-0 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Inventory System Console
          </CardTitle>
          <div className="flex space-x-1">
            <div className="flex items-center mr-2 space-x-2">
              <Checkbox 
                id="verbose" 
                checked={isVerbose}
                onCheckedChange={(checked) => setIsVerbose(!!checked)} 
              />
              <label htmlFor="verbose" className="text-xs cursor-pointer">Verbose</label>
              
              <Checkbox 
                id="autoscroll" 
                checked={isAutoScroll}
                onCheckedChange={(checked) => setIsAutoScroll(!!checked)} 
                className="ml-2"
              />
              <label htmlFor="autoscroll" className="text-xs cursor-pointer">Auto-scroll</label>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRunTests} title="Run Tests">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave} title="Save Logs">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClear} title="Clear Console">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} title="Minimize">
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} title="Close">
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
                // Highlight different message types
                let className = "mb-1 whitespace-pre-wrap break-words";
                
                if (log.includes('[error]')) {
                  className += " text-red-400";
                } else if (log.includes('[warn]')) {
                  className += " text-yellow-400";
                } else if (log.includes('[info]')) {
                  className += " text-blue-400";
                } else if (log.includes('===')) {
                  className += " text-purple-400 font-bold";
                }
                
                // Handle JSON strings to display them properly
                if (log.includes('{') || log.includes('[')) {
                  try {
                    // Extract JSON part of the log (if any)
                    const jsonMatch = log.match(/(\{.*\}|\[.*\])/);
                    if (jsonMatch) {
                      const jsonPart = jsonMatch[0];
                      const jsonObj = JSON.parse(jsonPart);
                      const formattedJson = JSON.stringify(jsonObj, null, 2);
                      const beforeJson = log.substring(0, log.indexOf(jsonPart));
                      const afterJson = log.substring(log.indexOf(jsonPart) + jsonPart.length);
                      
                      return (
                        <div key={index} className={className}>
                          {beforeJson}
                          <pre>{formattedJson}</pre>
                          {afterJson}
                        </div>
                      );
                    }
                  } catch {
                    // If it's not valid JSON, display as normal
                  }
                }
                
                // Display regular logs
                return <div key={index} className={className}>{log}</div>;
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Console;
