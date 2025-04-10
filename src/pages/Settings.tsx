
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Database, 
  User, 
  Bell,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { saveDatabase } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const [lowStockThreshold, setLowStockThreshold] = useState('150');
  const [expiryAlertDays, setExpiryAlertDays] = useState('30');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    // In a real app, this would save to the database
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    });
  };
  
  const handleExportDatabase = () => {
    try {
      const data = saveDatabase();
      if (!data) {
        toast({
          title: "Export Failed",
          description: "Could not export database",
          variant: "destructive",
        });
        return;
      }
      
      // Convert Uint8Array to Blob and create a download link
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'godown-inventory-backup.sqlite';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Database Exported",
        description: "Database has been successfully exported",
      });
    } catch (error) {
      console.error("Error exporting database:", error);
      toast({
        title: "Export Failed",
        description: "Could not export database",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <SettingsIcon className="h-7 w-7 mr-2" />
          Settings
        </h1>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>
                Configure threshold values for low stock and expiry alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input 
                    id="lowStockThreshold" 
                    type="number" 
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Items with stock below this value will trigger an alert
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryAlertDays">Expiry Alert Days</Label>
                  <Input 
                    id="expiryAlertDays" 
                    type="number" 
                    value={expiryAlertDays}
                    onChange={(e) => setExpiryAlertDays(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert for items expiring within this many days
                  </p>
                </div>
              </div>
              
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts and updates via email
                  </p>
                </div>
                <Switch 
                  id="emailNotifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="stockAlerts" className="text-base">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts when items fall below threshold
                  </p>
                </div>
                <Switch 
                  id="stockAlerts" 
                  checked={stockAlerts}
                  onCheckedChange={setStockAlerts}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="expiryAlerts" className="text-base">Expiry Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get alerts for items nearing expiration
                  </p>
                </div>
                <Switch 
                  id="expiryAlerts" 
                  checked={expiryAlerts}
                  onCheckedChange={setExpiryAlerts}
                />
              </div>
              
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Admin User" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="admin@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <Button>
                <User className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Backup and restore your inventory database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary" />
                    Backup Database
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Export a copy of your current database
                  </p>
                  <Button variant="outline" onClick={handleExportDatabase}>
                    Export Database
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-medium flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-primary" />
                    Restore Database
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Import a previously exported database file
                  </p>
                  <Button variant="outline">
                    Import Database
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 space-y-2 mt-4">
                <h3 className="font-medium flex items-center text-red-500">
                  <Database className="h-5 w-5 mr-2" />
                  Reset Database
                </h3>
                <p className="text-sm text-muted-foreground">
                  This will erase all data and restore default settings. This action cannot be undone.
                </p>
                <Button variant="destructive">
                  Reset Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
