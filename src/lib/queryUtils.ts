
import {
  executeQuery,
  getProducts,
  getWarehouses,
  getSuppliers,
  getLowStockProducts,
  getExpiringProducts,
  getRecentOrders,
  getInventoryBySupplier
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
  console.log("Calculating total stock across all warehouses...");
  const result = executeQuery(`
    SELECT SUM(quantity_in_stock) as total_stock
    FROM inventory_records
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  const totalStock = result[0].values[0][0] || 0;
  console.log(`Total stock: ${totalStock} units`);
  return totalStock;
};

export const getTotalProductCount = (): number => {
  console.log("Counting total unique products...");
  const result = executeQuery(`
    SELECT COUNT(*) as product_count
    FROM products
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  const productCount = result[0].values[0][0] || 0;
  console.log(`Total products: ${productCount}`);
  return productCount;
};

export const getProductStock = (productId: number | string): number => {
  console.log(`Getting total stock for product ID ${productId}...`);
  const result = executeQuery(`
    SELECT SUM(quantity_in_stock) as product_stock
    FROM inventory_records
    WHERE product_id = ?
  `, [productId]);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  const productStock = result[0].values[0][0] || 0;
  console.log(`Product ID ${productId} stock: ${productStock} units`);
  return productStock;
};

export const getPerishableProducts = (): any[] => {
  console.log("Retrieving list of perishable products (with expiry dates)...");
  const result = executeQuery(`
    SELECT p.*, SUM(ir.quantity_in_stock) as total_stock, s.supplier_name
    FROM products p
    JOIN inventory_records ir ON p.product_id = ir.product_id
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    WHERE ir.expiry_date IS NOT NULL
    GROUP BY p.product_id
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  
  const perishableProducts = result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    total_stock: row[6],
    supplier_name: row[7]
  }));
  
  console.log(`Found ${perishableProducts.length} perishable products`);
  return perishableProducts;
};

export const getTotalInventoryValue = (): number => {
  console.log("Calculating total inventory value...");
  const result = executeQuery(`
    SELECT SUM(p.price * ir.quantity_in_stock) as total_value
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  const totalValue = result[0].values[0][0] || 0;
  console.log(`Total inventory value: ${formatCurrency(totalValue)}`);
  return totalValue;
};

export const getRecentlyUpdatedProducts = (hours: number = 24): any[] => {
  console.log(`Retrieving products updated in the last ${hours} hours...`);
  const result = executeQuery(`
    SELECT p.*, ir.quantity_in_stock, ir.last_updated, s.supplier_name 
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    WHERE datetime(ir.last_updated) > datetime('now', '-${hours} hours')
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  
  const recentlyUpdated = result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    quantity_in_stock: row[6],
    last_updated: row[7],
    supplier_name: row[8]
  }));
  
  console.log(`Found ${recentlyUpdated.length} recently updated products`);
  return recentlyUpdated;
};

export const getAverageStockLevel = (): number => {
  console.log("Calculating average stock level per product...");
  const result = executeQuery(`
    SELECT AVG(quantity_in_stock) as average_stock
    FROM inventory_records
  `);
  
  if (result.length === 0 || !result[0].values || !result[0].values[0]) return 0;
  const averageStock = Math.round(result[0].values[0][0] || 0);
  console.log(`Average stock level: ${averageStock} units`);
  return averageStock;
};

// Product Information Queries
export const getProductDetails = (productId: number | string): any => {
  console.log(`Getting detailed information for product ID ${productId}...`);
  const result = executeQuery(`
    SELECT p.*, s.supplier_name,
    (SELECT SUM(quantity_in_stock) FROM inventory_records WHERE product_id = p.product_id) as total_stock
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    WHERE p.product_id = ?
  `, [productId]);
  
  if (result.length === 0 || !result[0].values || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  const productDetails = {
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    supplier_name: row[6],
    total_stock: row[7] || 0
  };
  
  console.log(`Retrieved details for product: ${productDetails.product_name}`);
  return productDetails;
};

// Supplier Information Queries
export const getSupplierDetails = (supplierId: number | string): any => {
  console.log(`Getting detailed information for supplier ID ${supplierId}...`);
  const result = executeQuery(`
    SELECT * FROM suppliers WHERE supplier_id = ?
  `, [supplierId]);
  
  if (result.length === 0 || !result[0].values || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  const supplierDetails = {
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
  
  console.log(`Retrieved details for supplier: ${supplierDetails.supplier_name}`);
  return supplierDetails;
};

export const getSupplierProducts = (supplierId: number | string): any[] => {
  console.log(`Getting products supplied by supplier ID ${supplierId}...`);
  const result = executeQuery(`
    SELECT p.*,
    (SELECT SUM(quantity_in_stock) FROM inventory_records WHERE product_id = p.product_id) as total_stock
    FROM products p
    WHERE p.supplier_id = ?
  `, [supplierId]);
  
  if (result.length === 0 || !result[0].values) return [];
  
  const supplierProducts = result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    total_stock: row[6] || 0
  }));
  
  console.log(`Found ${supplierProducts.length} products from supplier ID ${supplierId}`);
  return supplierProducts;
};

export const getSuppliersProductCount = (): any[] => {
  console.log("Getting product count by supplier...");
  const result = executeQuery(`
    SELECT s.supplier_id, s.supplier_name, COUNT(p.product_id) as product_count
    FROM suppliers s
    LEFT JOIN products p ON s.supplier_id = p.supplier_id
    GROUP BY s.supplier_id
  `);
  
  if (result.length === 0 || !result[0].values) return [];
  
  const suppliersProductCount = result[0].values.map((row: any[]) => ({
    supplier_id: row[0],
    supplier_name: row[1],
    product_count: row[2]
  }));
  
  console.log(`Retrieved product counts for ${suppliersProductCount.length} suppliers`);
  return suppliersProductCount;
};

// Get supplier inventory summary
export const getSupplierInventorySummary = (supplierId: number | string): any => {
  console.log(`Getting inventory summary for supplier ID ${supplierId}...`);
  
  // Get all products and inventory records for this supplier
  const inventory = getInventoryBySupplier(parseInt(supplierId.toString()));
  
  if (inventory.length === 0) {
    console.log(`No inventory found for supplier ID ${supplierId}`);
    return {
      total_products: 0,
      total_stock: 0,
      total_value: 0,
      warehouses: [],
      categories: []
    };
  }
  
  // Calculate totals and summaries
  const uniqueProducts = new Set();
  let totalStock = 0;
  let totalValue = 0;
  const warehouseTotals: {[key: string]: number} = {};
  const categoryTotals: {[key: string]: number} = {};
  
  inventory.forEach(item => {
    uniqueProducts.add(item.product_id);
    totalStock += item.quantity_in_stock;
    totalValue += item.price * item.quantity_in_stock;
    
    // Count by warehouse
    if (warehouseTotals[item.warehouse_name]) {
      warehouseTotals[item.warehouse_name] += item.quantity_in_stock;
    } else {
      warehouseTotals[item.warehouse_name] = item.quantity_in_stock;
    }
    
    // Count by category
    if (item.category) {
      if (categoryTotals[item.category]) {
        categoryTotals[item.category] += item.quantity_in_stock;
      } else {
        categoryTotals[item.category] = item.quantity_in_stock;
      }
    }
  });
  
  // Format for return
  const warehouseSummary = Object.entries(warehouseTotals).map(([name, quantity]) => ({
    name,
    quantity
  }));
  
  const categorySummary = Object.entries(categoryTotals).map(([name, quantity]) => ({
    name,
    quantity
  }));
  
  const summary = {
    total_products: uniqueProducts.size,
    total_stock: totalStock,
    total_value: totalValue,
    warehouses: warehouseSummary,
    categories: categorySummary
  };
  
  console.log(`Supplier ID ${supplierId} has ${summary.total_products} products with ${summary.total_stock} total units worth ${formatCurrency(summary.total_value)}`);
  return summary;
};

// Run a test for all the queries and log the results to console
export const runInventoryTests = (verbose: boolean = true): void => {
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
  if (verbose && recentlyUpdated.length > 0) {
    recentlyUpdated.forEach(product => {
      console.log(`- ${product.product_name}: ${product.quantity_in_stock} units (Updated: ${product.last_updated})`);
    });
  }
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
    
    // Get supplier inventory summary
    const supplierSummary = getSupplierInventorySummary(sampleSupplier.supplier_id);
    console.log(`Inventory Summary for ${sampleSupplier.supplier_name}:`);
    if (verbose) {
      console.log(`- Total Products: ${supplierSummary.total_products}`);
      console.log(`- Total Stock: ${supplierSummary.total_stock} units`);
      console.log(`- Total Value: ${formatCurrency(supplierSummary.total_value)}`);
      console.log(`- Warehouse Distribution:`);
      supplierSummary.warehouses.forEach((warehouse: any) => {
        console.log(`  * ${warehouse.name}: ${warehouse.quantity} units`);
      });
      console.log(`- Category Distribution:`);
      supplierSummary.categories.forEach((category: any) => {
        console.log(`  * ${category.name}: ${category.quantity} units`);
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
