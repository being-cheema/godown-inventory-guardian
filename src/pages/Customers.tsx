
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Edit,
  Trash2,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { executeQuery } from '@/lib/database';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      // Get customers from database
      const result = executeQuery(`
        SELECT * FROM customers
      `);
      
      if (result.length === 0) {
        setCustomers([]);
        return;
      }
      
      const fetchedCustomers = result[0].values.map((row: any[]) => ({
        customer_id: row[0],
        first_name: row[1],
        last_name: row[2],
        name: row[3] || `${row[1]} ${row[2]}`,
        phone_number: row[4],
        email: row[5],
        shipping_address: row[6],
        date_of_birth: row[7]
      }));
      
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    }
  }, []);
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          <Users className="h-7 w-7 mr-2" />
          Customers
        </h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Customer Directory</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {customers.length} customers
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Shipping Address</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((customer) => (
                  <tr key={customer.customer_id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      {customer.name || `${customer.first_name} ${customer.last_name}`}
                    </td>
                    <td className="p-3">
                      {customer.email ? (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {customer.email}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="p-3">
                      {customer.phone_number ? (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {customer.phone_number}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="p-3">
                      {customer.shipping_address || 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
