import initSqlJs, { Database } from 'sql.js';

// Database singleton instance
let db: Database | null = null;

// Initialize the database
export const initDatabase = async (): Promise<Database> => {
  if (db) return db;
  
  try {
    // Load SQL.js
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
    
    // Create a new database
    db = new SQL.Database();
    
    // Create tables
    createTables();
    
    // Insert sample data for testing
    insertSampleData();
    
    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
};

// Create database tables
const createTables = () => {
  if (!db) return;
  
  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT,
      supplier_id INTEGER,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    )
  `);
  
  // Suppliers table
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_name TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      contact_phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      locality TEXT,
      country TEXT
    )
  `);
  
  // Warehouses table
  db.run(`
    CREATE TABLE IF NOT EXISTS warehouses (
      warehouse_id INTEGER PRIMARY KEY AUTOINCREMENT,
      warehouse_name TEXT NOT NULL,
      location TEXT,
      contact_number TEXT
    )
  `);
  
  // Inventory records table
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory_records (
      record_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      warehouse_id INTEGER NOT NULL,
      quantity_in_stock INTEGER NOT NULL,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiry_date DATE,
      supplier_id INTEGER,
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    )
  `);
  
  // Customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      name TEXT,
      phone_number TEXT,
      email TEXT,
      shipping_address TEXT,
      date_of_birth DATE
    )
  `);
  
  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount REAL,
      shipping_address TEXT,
      order_status TEXT DEFAULT 'Pending',
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
  `);
  
  // Order Items table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity_ordered INTEGER NOT NULL,
      item_price REAL NOT NULL,
      total_price REAL,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
  `);
};

// Insert sample data for testing
const insertSampleData = () => {
  if (!db) return;
  
  // Sample suppliers
  db.run(`
    INSERT INTO suppliers (supplier_name, first_name, last_name, contact_phone, email, address, city, state, country)
    VALUES 
      ('Fresh Foods Inc', 'John', 'Doe', '555-123-4567', 'john@freshfoods.com', '123 Main St', 'Boston', 'MA', 'USA'),
      ('Organic Farms', 'Jane', 'Smith', '555-765-4321', 'jane@organicfarms.com', '456 Oak Ave', 'Portland', 'OR', 'USA'),
      ('Global Grains', 'Tom', 'Wilson', '555-987-6543', 'tom@globalgrains.com', '789 Pine Rd', 'Chicago', 'IL', 'USA'),
      ('Quality Meats', 'Michael', 'Brown', '555-111-2233', 'michael@qualitymeats.com', '101 Butcher St', 'New York', 'NY', 'USA'),
      ('Dairy Dream', 'Sarah', 'Johnson', '555-444-5566', 'sarah@dairydream.com', '202 Milk Ave', 'Madison', 'WI', 'USA'),
      ('Seafood Supreme', 'David', 'Lee', '555-777-8899', 'david@seafoodsupreme.com', '303 Ocean Blvd', 'Seattle', 'WA', 'USA')
  `);
  
  // Sample warehouses
  db.run(`
    INSERT INTO warehouses (warehouse_name, location, contact_number)
    VALUES 
      ('Central Warehouse', 'Downtown', '555-111-2222'),
      ('North Facility', 'North District', '555-333-4444'),
      ('South Storage', 'South District', '555-555-6666'),
      ('East Distribution Center', 'East Side', '555-777-8888'),
      ('West Logistics Hub', 'West Side', '555-999-0000')
  `);
  
  // Sample products - expanded to 20+ products
  db.run(`
    INSERT INTO products (product_name, description, price, category, supplier_id)
    VALUES 
      ('Rice', 'Premium basmati rice', 12.99, 'Grains', 3),
      ('Wheat Flour', 'All-purpose wheat flour', 5.99, 'Baking', 3),
      ('Tomatoes', 'Fresh organic tomatoes', 3.99, 'Vegetables', 2),
      ('Apples', 'Red delicious apples', 4.99, 'Fruits', 2),
      ('Chicken', 'Free-range chicken', 8.99, 'Meat', 1),
      ('Milk', 'Organic whole milk', 3.49, 'Dairy', 1),
      ('Beef Steak', 'Prime cut beef steak', 15.99, 'Meat', 4),
      ('Salmon', 'Wild caught salmon', 12.99, 'Seafood', 6),
      ('Yogurt', 'Greek yogurt', 4.49, 'Dairy', 5),
      ('Cheese', 'Aged cheddar cheese', 6.99, 'Dairy', 5),
      ('Potatoes', 'Russet potatoes', 2.99, 'Vegetables', 2),
      ('Onions', 'Yellow onions', 1.99, 'Vegetables', 2),
      ('Oranges', 'Navel oranges', 3.99, 'Fruits', 2),
      ('Bananas', 'Organic bananas', 1.99, 'Fruits', 2),
      ('Pasta', 'Italian spaghetti', 2.49, 'Grains', 3),
      ('Bread', 'Whole wheat bread', 3.99, 'Bakery', 3),
      ('Butter', 'Unsalted butter', 4.99, 'Dairy', 5),
      ('Eggs', 'Free-range eggs', 5.49, 'Dairy', 1),
      ('Pork Chops', 'Boneless pork chops', 9.99, 'Meat', 4),
      ('Shrimp', 'Jumbo shrimp', 14.99, 'Seafood', 6),
      ('Tuna', 'Yellowfin tuna steaks', 16.99, 'Seafood', 6),
      ('Ground Beef', 'Lean ground beef', 7.99, 'Meat', 4),
      ('Sugar', 'Granulated sugar', 3.49, 'Baking', 3),
      ('Salt', 'Sea salt', 2.29, 'Spices', 3)
  `);
  
  // Sample inventory records - matching products
  db.run(`
    INSERT INTO inventory_records (product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id)
    VALUES 
      (1, 1, 500, '2024-12-31', 3),
      (2, 1, 300, '2024-10-15', 3),
      (3, 2, 150, '2024-04-30', 2),
      (4, 2, 200, '2024-05-20', 2),
      (5, 3, 100, '2024-04-25', 1),
      (6, 3, 250, '2024-04-18', 1),
      (7, 3, 80, '2024-05-10', 4),
      (8, 4, 120, '2024-04-15', 6),
      (9, 4, 200, '2024-06-30', 5),
      (10, 5, 150, '2024-07-15', 5),
      (11, 2, 400, '2024-08-20', 2),
      (12, 2, 350, '2024-08-10', 2),
      (13, 2, 180, '2024-06-15', 2),
      (14, 2, 250, '2024-05-05', 2),
      (15, 1, 200, '2024-11-20', 3),
      (16, 1, 150, '2024-04-25', 3),
      (17, 4, 100, '2024-05-30', 5),
      (18, 3, 300, '2024-05-15', 1),
      (19, 3, 90, '2024-05-20', 4),
      (20, 4, 70, '2024-04-20', 6),
      (21, 4, 60, '2024-04-30', 6),
      (22, 3, 120, '2024-05-25', 4),
      (23, 1, 250, '2024-12-31', 3),
      (24, 1, 300, '2024-12-31', 3)
  `);
  
  // Sample customers
  db.run(`
    INSERT INTO customers (first_name, last_name, name, phone_number, email, shipping_address)
    VALUES 
      ('Michael', 'Johnson', 'Michael Johnson', '555-111-3333', 'michael@example.com', '123 Pine St, New York, NY'),
      ('Sarah', 'Williams', 'Sarah Williams', '555-444-6666', 'sarah@example.com', '456 Elm St, Los Angeles, CA'),
      ('David', 'Brown', 'David Brown', '555-777-9999', 'david@example.com', '789 Maple St, Chicago, IL')
  `);
  
  // Sample orders
  db.run(`
    INSERT INTO orders (customer_id, order_date, total_amount, shipping_address, order_status)
    VALUES 
      (1, '2024-03-01 10:30:00', 129.95, '123 Pine St, New York, NY', 'Delivered'),
      (2, '2024-03-10 14:45:00', 75.97, '456 Elm St, Los Angeles, CA', 'Shipped'),
      (3, '2024-03-20 09:15:00', 49.95, '789 Maple St, Chicago, IL', 'Pending')
  `);
  
  // Sample order items
  db.run(`
    INSERT INTO order_items (order_id, product_id, quantity_ordered, item_price, total_price)
    VALUES 
      (1, 1, 5, 12.99, 64.95),
      (1, 5, 5, 8.99, 44.95),
      (1, 6, 2, 3.49, 6.98),
      (2, 2, 6, 5.99, 35.94),
      (2, 4, 8, 4.99, 39.92),
      (3, 3, 5, 3.99, 19.95),
      (3, 6, 8, 3.49, 27.92)
  `);
};

// Database operations
export const executeQuery = (sql: string, params: any[] = []): any[] => {
  if (!db) throw new Error("Database not initialized");
  
  try {
    return db.exec(sql, params);
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

// Get all products
export const getProducts = (): any[] => {
  console.log("Fetching all products with supplier information and total stock...");
  const result = executeQuery(`
    SELECT p.*, s.supplier_name, 
    (SELECT SUM(quantity_in_stock) FROM inventory_records WHERE product_id = p.product_id) as total_stock
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
  `);
  
  if (result.length === 0) return [];
  
  const products = result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    supplier_name: row[6],
    total_stock: row[7] || 0
  }));
  
  console.log(`Retrieved ${products.length} products from database`);
  return products;
};

// Get low stock products
export const getLowStockProducts = (threshold: number = 100): any[] => {
  const result = executeQuery(`
    SELECT p.*, s.supplier_name, ir.quantity_in_stock, ir.expiry_date
    FROM products p
    JOIN inventory_records ir ON p.product_id = ir.product_id
    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
    WHERE ir.quantity_in_stock < ?
  `, [threshold]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    supplier_id: row[5],
    supplier_name: row[6],
    quantity_in_stock: row[7],
    expiry_date: row[8]
  }));
};

// Get expiring products
export const getExpiringProducts = (daysThreshold: number = 30): any[] => {
  const date = new Date();
  date.setDate(date.getDate() + daysThreshold);
  const thresholdDate = date.toISOString().split('T')[0];
  
  const result = executeQuery(`
    SELECT p.*, ir.quantity_in_stock, ir.expiry_date, w.warehouse_name
    FROM products p
    JOIN inventory_records ir ON p.product_id = ir.product_id
    JOIN warehouses w ON ir.warehouse_id = w.warehouse_id
    WHERE ir.expiry_date <= ? AND ir.expiry_date >= date('now')
    ORDER BY ir.expiry_date ASC
  `, [thresholdDate]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    product_id: row[0],
    product_name: row[1],
    description: row[2],
    price: row[3],
    category: row[4],
    quantity_in_stock: row[5],
    expiry_date: row[6],
    warehouse_name: row[7]
  }));
};

// Add a new product
export const addProduct = (product: any): number => {
  const { product_name, description, price, category, supplier_id } = product;
  
  const result = executeQuery(`
    INSERT INTO products (product_name, description, price, category, supplier_id)
    VALUES (?, ?, ?, ?, ?)
  `, [product_name, description, price, category, supplier_id]);
  
  return db?.getRowsModified() || 0;
};

// Update product
export const updateProduct = (product: any): number => {
  const { product_id, product_name, description, price, category, supplier_id } = product;
  
  const result = executeQuery(`
    UPDATE products
    SET product_name = ?, description = ?, price = ?, category = ?, supplier_id = ?
    WHERE product_id = ?
  `, [product_name, description, price, category, supplier_id, product_id]);
  
  return db?.getRowsModified() || 0;
};

// Add inventory record
export const addInventoryRecord = (record: any): number => {
  const { product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id } = record;
  
  const result = executeQuery(`
    INSERT INTO inventory_records (product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id)
    VALUES (?, ?, ?, ?, ?)
  `, [product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id]);
  
  return db?.getRowsModified() || 0;
};

// Update inventory record
export const updateInventoryRecord = (record: any): number => {
  const { record_id, product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id } = record;
  
  const result = executeQuery(`
    UPDATE inventory_records
    SET product_id = ?, warehouse_id = ?, quantity_in_stock = ?, expiry_date = ?, supplier_id = ?, last_updated = CURRENT_TIMESTAMP
    WHERE record_id = ?
  `, [product_id, warehouse_id, quantity_in_stock, expiry_date, supplier_id, record_id]);
  
  return db?.getRowsModified() || 0;
};

// Get inventory by warehouse
export const getInventoryByWarehouse = (warehouse_id: number): any[] => {
  const result = executeQuery(`
    SELECT ir.*, p.product_name, p.category, p.price, s.supplier_name
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
    LEFT JOIN suppliers s ON ir.supplier_id = s.supplier_id
    WHERE ir.warehouse_id = ?
  `, [warehouse_id]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    record_id: row[0],
    product_id: row[1],
    warehouse_id: row[2],
    quantity_in_stock: row[3],
    last_updated: row[4],
    expiry_date: row[5],
    supplier_id: row[6],
    product_name: row[7],
    category: row[8],
    price: row[9],
    supplier_name: row[10]
  }));
};

// Get inventory by product
export const getInventoryByProduct = (product_id: number): any[] => {
  const result = executeQuery(`
    SELECT ir.*, p.product_name, p.category, p.price, s.supplier_name, w.warehouse_name 
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
    JOIN warehouses w ON ir.warehouse_id = w.warehouse_id
    LEFT JOIN suppliers s ON ir.supplier_id = s.supplier_id
    WHERE ir.product_id = ?
    ORDER BY ir.quantity_in_stock DESC
  `, [product_id]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    record_id: row[0],
    product_id: row[1],
    warehouse_id: row[2],
    quantity_in_stock: row[3],
    last_updated: row[4],
    expiry_date: row[5],
    supplier_id: row[6],
    product_name: row[7],
    category: row[8],
    price: row[9],
    supplier_name: row[10],
    warehouse_name: row[11]
  }));
};

// Get inventory by supplier
export const getInventoryBySupplier = (supplier_id: number): any[] => {
  const result = executeQuery(`
    SELECT ir.*, p.product_name, p.category, p.price, w.warehouse_name 
    FROM inventory_records ir
    JOIN products p ON ir.product_id = p.product_id
    JOIN warehouses w ON ir.warehouse_id = w.warehouse_id
    WHERE ir.supplier_id = ? OR p.supplier_id = ?
  `, [supplier_id, supplier_id]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    record_id: row[0],
    product_id: row[1],
    warehouse_id: row[2],
    quantity_in_stock: row[3],
    last_updated: row[4],
    expiry_date: row[5],
    supplier_id: row[6],
    product_name: row[7],
    category: row[8],
    price: row[9],
    warehouse_name: row[10]
  }));
};

// Get all warehouses
export const getWarehouses = (): any[] => {
  const result = executeQuery(`SELECT * FROM warehouses`);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    warehouse_id: row[0],
    warehouse_name: row[1],
    location: row[2],
    contact_number: row[3]
  }));
};

// Get all suppliers
export const getSuppliers = (): any[] => {
  const result = executeQuery(`SELECT * FROM suppliers`);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
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
  }));
};

// Add supplier
export const addSupplier = (supplier: any): number => {
  const { supplier_name, first_name, last_name, contact_phone, email, address, city, state, locality, country } = supplier;
  
  const result = executeQuery(`
    INSERT INTO suppliers (supplier_name, first_name, last_name, contact_phone, email, address, city, state, locality, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [supplier_name, first_name, last_name, contact_phone, email, address, city, state, locality, country]);
  
  // Get the last inserted ID
  const idResult = executeQuery(`SELECT last_insert_rowid()`);
  if (idResult.length === 0 || !idResult[0].values || !idResult[0].values[0]) return 0;
  return idResult[0].values[0][0];
};

// Update supplier
export const updateSupplier = (supplier: any): number => {
  const { supplier_id, supplier_name, first_name, last_name, contact_phone, email, address, city, state, locality, country } = supplier;
  
  const result = executeQuery(`
    UPDATE suppliers
    SET supplier_name = ?, first_name = ?, last_name = ?, contact_phone = ?, email = ?, address = ?, city = ?, state = ?, locality = ?, country = ?
    WHERE supplier_id = ?
  `, [supplier_name, first_name, last_name, contact_phone, email, address, city, state, locality, country, supplier_id]);
  
  return db?.getRowsModified() || 0;
};

// Delete supplier with proper cascading
export const deleteSupplier = (supplier_id: number): number => {
  console.log(`Deleting supplier ID ${supplier_id} with proper cascading...`);
  
  // Get all products by this supplier first
  const productsResult = executeQuery(`
    SELECT product_id FROM products WHERE supplier_id = ?
  `, [supplier_id]);
  
  let productIds: number[] = [];
  if (productsResult.length > 0 && productsResult[0].values) {
    productIds = productsResult[0].values.map((row: any[]) => row[0]);
    console.log(`Found ${productIds.length} products linked to supplier ${supplier_id}`);
  }
  
  // First, update any products to remove the supplier reference
  executeQuery(`
    UPDATE products
    SET supplier_id = NULL
    WHERE supplier_id = ?
  `, [supplier_id]);
  
  // Next, update inventory records to remove the supplier reference
  executeQuery(`
    UPDATE inventory_records
    SET supplier_id = NULL
    WHERE supplier_id = ?
  `, [supplier_id]);
  
  // Finally, delete the supplier
  const result = executeQuery(`
    DELETE FROM suppliers
    WHERE supplier_id = ?
  `, [supplier_id]);
  
  return db?.getRowsModified() || 0;
};

// Get recent orders
export const getRecentOrders = (limit: number = 10): any[] => {
  const result = executeQuery(`
    SELECT o.*, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    ORDER BY o.order_date DESC
    LIMIT ?
  `, [limit]);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    order_id: row[0],
    customer_id: row[1],
    order_date: row[2],
    total_amount: row[3],
    shipping_address: row[4],
    order_status: row[5],
    customer_name: row[6]
  }));
};

// Save database to file
export const saveDatabase = (): Uint8Array | null => {
  if (!db) return null;
  return db.export();
};

// Load database from file
export const loadDatabase = (data: Uint8Array): void => {
  if (!db) return;
  db.close();
  initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`
  }).then(SQL => {
    db = new SQL.Database(data);
  });
};

// Get all customers
export const getCustomers = (): any[] => {
  const result = executeQuery(`SELECT * FROM customers`);
  
  if (result.length === 0) return [];
  return result[0].values.map((row: any[]) => ({
    customer_id: row[0],
    first_name: row[1],
    last_name: row[2],
    name: row[3],
    phone_number: row[4],
    email: row[5],
    shipping_address: row[6],
    date_of_birth: row[7]
  }));
};

// Add a new order
export const addOrder = (order: any): number => {
  const { customer_id, total_amount, shipping_address, order_status } = order;
  
  const result = executeQuery(`
    INSERT INTO orders (customer_id, total_amount, shipping_address, order_status)
    VALUES (?, ?, ?, ?)
  `, [customer_id, total_amount, shipping_address, order_status || 'Pending']);
  
  // Get the last inserted ID
  const idResult = executeQuery(`SELECT last_insert_rowid()`);
  if (idResult.length === 0 || !idResult[0].values || !idResult[0].values[0]) return 0;
  return idResult[0].values[0][0];
};

// Add order items
export const addOrderItems = (items: any[]): number => {
  let count = 0;
  
  items.forEach(item => {
    const { order_id, product_id, quantity_ordered, item_price } = item;
    const total_price = quantity_ordered * item_price;
    
    executeQuery(`
      INSERT INTO order_items (order_id, product_id, quantity_ordered, item_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `, [order_id, product_id, quantity_ordered, item_price, total_price]);
    
    count++;
  });
  
  return count;
};

// Update order status
export const updateOrderStatus = (order_id: number, status: string): number => {
  const result = executeQuery(`
    UPDATE orders
    SET order_status = ?
    WHERE order_id = ?
  `, [status, order_id]);
  
  return db?.getRowsModified() || 0;
};

// Get order details with items
export const getOrderDetails = (order_id: number): any => {
  const orderResult = executeQuery(`
    SELECT o.*, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_id = ?
  `, [order_id]);
  
  if (orderResult.length === 0 || !orderResult[0].values || orderResult[0].values.length === 0) return null;
  
  const order = {
    order_id: orderResult[0].values[0][0],
    customer_id: orderResult[0].values[0][1],
    order_date: orderResult[0].values[0][2],
    total_amount: orderResult[0].values[0][3],
    shipping_address: orderResult[0].values[0][4],
    order_status: orderResult[0].values[0][5],
    customer_name: orderResult[0].values[0][6]
  };
  
  const itemsResult = executeQuery(`
    SELECT oi.*, p.product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = ?
  `, [order_id]);
  
  let items = [];
  if (itemsResult.length > 0 && itemsResult[0].values) {
    items = itemsResult[0].values.map((row: any[]) => ({
      order_item_id: row[0],
      order_id: row[1],
      product_id: row[2],
      quantity_ordered: row[3],
      item_price: row[4],
      total_price: row[5],
      product_name: row[6]
    }));
  }
  
  return { ...order, items };
};

// Properly update inventory when placing an order
export const updateInventoryForOrder = (orderItems: any[]): {success: boolean, message: string} => {
  console.log(`Updating inventory for ${orderItems.length} order items...`);
  
  let result = {success: true, message: "Inventory updated successfully"};
  
  orderItems.forEach(item => {
    const productId = parseInt(item.product_id);
    const quantity = parseInt(item.quantity);
    
    // Get all inventory records for this product
    const inventoryRecords = getInventoryByProduct(productId);
    
    if (inventoryRecords.length > 0) {
      let remainingQuantity = quantity;
      
      // Loop through inventory records and update each one until we've deducted all required quantity
      for (let i = 0; i
