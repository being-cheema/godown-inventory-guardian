import {
  executeQuery,
  getProducts,
  getWarehouses,
  getSuppliers,
  getLowStockProducts,
  getExpiringProducts,
  getRecentOrders
} from './database';

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// General Inventory Queries
export const getTotalStock = (): number => {
  const result = executeQuery(`
    SELECT SUM(quantity_in_stock) as total_stock
    FROM inventory_records
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  return result[0].values[0][0] || 0;
};

export const getTotalProductCount = (): number => {
  const result = executeQuery(`
    SELECT COUNT(*) as product_count
    FROM products
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  return result[0].values[0][0] || 0;
};

export const getProductStock = (productId: number | string): number => {
  const result = executeQuery(`
    SELECT SUM(quantity_in_stock) as product_stock
    FROM inventory_records
    WHERE product_id = ?
  `, [productId]);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  return result[0].values[0][0] || 0;
};

export const getPerishableProducts = (): any[] => {
  const result = executeQuery(`
    SELECT p.*, SUM(ir.quantity_in_stock) as total_stock
    FROM products p
    JOIN inventory_records ir ON p.product_id = ir.product_id
    WHERE ir.expiry_date IS NOT NULL
    GROUP BY p.product_id
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  return result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    total_stock: row[6]
  }));
};

export const getTotalInventoryValue = (): number => {
  const result = executeQuery(`
    SELECT SUM(p.price * ir.quantity_in_stock) as total_value
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  return result[0].values[0][0] || 0;
};

export const getRecentlyUpdatedProducts = (hours: number = 24): any[] => {
  const result = executeQuery(`
    SELECT p.*, ir.quantity_in_stock, ir.last_updated 
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
    WHERE datetime(ir.last_updated) > datetime('now', '-${hours} hours')
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  return result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    quantity_in_stock: row[6],
    last_updated: row[7]
  }));
};

export const getAverageStockLevel = (): number => {
  const result = executeQuery(`
    SELECT AVG(quantity_in_stock) as average_stock
    FROM inventory_records
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  return Math.round(result[0].values[0][0] || 0);
};

// Product Information Queries
export const getProductDetails = (productId: number | string): any => {
  const result = executeQuery(`
    SELECT p.*, s.supplier_name,
    (SELECT SUM(quantity_in_stock) FROM inventory_records WHERE product_id = p.product_id) as total_stock
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    WHERE p.product_id = ?
  `, [productId]);
  
  if (result.length === 0 || !result[0].values || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    supplier_name: row[6],
    total_stock: row[7] || 0
  };
};

// Supplier Information Queries
export const getSupplierDetails = (supplierId: number | string): any => {
  const result = executeQuery(`
    SELECT * FROM suppliers WHERE supplier_id = ?
  `, [supplierId]);
  
  if (result.length === 0 || !result[0].values || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    supplier_id: row[0],
    supplier_name: row[1],
    first_name: row[2],
    last_name: row[3],
    contact_phone: row[4],
    email: row[5],
    address: row[6],
    city: row[7],
    state: row[8],
    locality: row[9],
    country: row[10]
  };
};

export const getSupplierProducts = (supplierId: number | string): any[] => {
  const result = executeQuery(`
    SELECT p.*,
    (SELECT SUM(quantity_in_stock) FROM inventory_records WHERE product_id = p.product_id) as total_stock
    FROM products p
    WHERE p.supplier_id = ?
  `, [supplierId]);
  
  if (result.length === 0 || !result[0].values) return [];
  return result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    total_stock: row[6] || 0
  }));
};

export const getSuppliersProductCount = (): any[] => {
  const result = executeQuery(`
    SELECT s.supplier_id, s.supplier_name, COUNT(p.product_id) as product_count
    FROM suppliers s
    LEFT JOIN products p ON s.supplier_id = p.supplier_id
    GROUP BY s.supplier_id
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  return result[0].values.map((row: any[]) => ({
    supplier_id: row[0],
    supplier_name: row[1],
    product_count: row[2]
  }));
};

// Run a test for all the queries and log the results to console
export const runInventoryTests = (verbose = true) => {
  console.group("📊 Inventory Management System - Test Results");
  
  // General Inventory Tests
  console.group("🔍 General Inventory Tests");
  console.log(`Total Stock in Warehouse: ${getTotalStock()} units`);
  console.log(`Total Products in Database: ${getTotalProductCount()}`);
  console.log(`Average Stock Level: ${getAverageStockLevel()} units`);
  console.log(`Total Inventory Value: ${formatCurrency(getTotalInventoryValue())}`);
  
  const lowStockProducts = getLowStockProducts(100);
  console.log(`Low Stock Products (below 100 units): ${lowStockProducts.length} products`);
  if (verbose) {
    lowStockProducts.forEach(product => {
      console.log(`- ${product.product_name}: ${product.quantity_in_stock} units`);
    });
  }
  
  const perishableProducts = getPerishableProducts();
  console.log(`Perishable Products: ${perishableProducts.length} products`);
  if (verbose) {
    perishableProducts.forEach(product => {
      console.log(`- ${product.product_name} (${product.total_stock} units)`);
    });
  }
  
  const expiringProducts = getExpiringProducts(30);
  console.log(`Products Expiring in 30 Days: ${expiringProducts.length} products`);
  if (verbose) {
    expiringProducts.forEach(product => {
      console.log(`- ${product.product_name}: Expires on ${product.expiry_date}`);
    });
  }
  
  const recentlyUpdated = getRecentlyUpdatedProducts(24);
  console.log(`Products Updated in Last 24 Hours: ${recentlyUpdated.length} products`);
  console.groupEnd();
  
  // Product Information Tests
  console.group("🏷️ Product Information Tests");
  const products = getProducts();
  if (products.length > 0) {
    const sampleProduct = getProductDetails(products[0].product_id);
    console.log(`Sample Product Details:`);
    if (verbose) {
      console.log(sampleProduct);
    }
    console.log(`Stock of ${sampleProduct.product_name}: ${getProductStock(sampleProduct.product_id)} units`);
  }
  console.groupEnd();
  
  // Supplier Information Tests
  console.group("🏭 Supplier Information Tests");
  const suppliers = getSuppliers();
  console.log(`Total Suppliers: ${suppliers.length}`);
  
  const supplierProductCounts = getSuppliersProductCount();
  console.log(`Supplier Product Counts:`);
  if (verbose) {
    supplierProductCounts.forEach(supplier => {
      console.log(`- ${supplier.supplier_name}: ${supplier.product_count} products`);
    });
  }
  
  if (suppliers.length > 0) {
    const sampleSupplier = getSupplierDetails(suppliers[0].supplier_id);
    console.log(`Sample Supplier Details:`);
    if (verbose) {
      console.log(sampleSupplier);
    }
    
    const supplierProducts = getSupplierProducts(sampleSupplier.supplier_id);
    console.log(`Products from ${sampleSupplier.supplier_name}: ${supplierProducts.length} products`);
    if (verbose) {
      supplierProducts.forEach(product => {
        console.log(`- ${product.product_name} (${product.total_stock} units)`);
      });
    }
  }
  console.groupEnd();
  
  // Order Information Tests
  console.group("📦 Order Information Tests");
  const recentOrders = getRecentOrders(10);
  console.log(`Recent Orders: ${recentOrders.length}`);
  if (verbose && recentOrders.length > 0) {
    console.log(`Sample Order Details:`);
    console.log(recentOrders[0]);
  }
  console.groupEnd();
  
  console.groupEnd();
};
