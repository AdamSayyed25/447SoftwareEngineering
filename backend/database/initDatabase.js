import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory if it doesn't exist
const dataDir = join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'doordash.db');
const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export { db, dbRun, dbGet, dbAll };

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        restaurant_location_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_location_id) REFERENCES locations(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Locations table
      db.run(`CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hours TEXT NOT NULL,
        address TEXT NOT NULL
      )`, (err) => {
        if (err) reject(err);
      });

      // Menu items table
      db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        location_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT DEFAULT 'main',
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Drop-off locations table
      db.run(`CREATE TABLE IF NOT EXISTS drop_off_locations (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )`, (err) => {
        if (err) reject(err);
      });

      // Orders table
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        drop_off_location TEXT NOT NULL,
        recipient_name TEXT,
        driver_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Backfill columns if existing DB lacks them (safe no-op if present)
      db.run(`ALTER TABLE orders ADD COLUMN recipient_name TEXT`, () => {});
      db.run(`ALTER TABLE orders ADD COLUMN driver_id TEXT`, () => {});

      // Feedback table
      db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`, (err) => {
        if (err) reject(err);
        console.log('✓ Database initialized successfully');
        resolve();
      });
    });
  });
}

export async function seedDatabase() {
  console.log('Seeding database...');

  // Check if data already exists
  const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  // Seed demo users with all 4 roles
  await dbRun(`
    INSERT INTO users (username, password_hash, role, restaurant_location_id) 
    VALUES 
    ('student', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'customer', NULL),
    ('faculty', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'customer', NULL),
    ('driver1', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'driver', NULL),
    ('staff_caton', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'restaurant_staff', 'caton'),
    ('staff_dunk', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'restaurant_staff', 'dunk'),
    ('admin', '$2a$10$rOzJcXYfX.KYWxXpqZGPNeqLjZ9zXKQHXT8ZcJELyNBdLBONCRnVS', 'admin', NULL)
  `);

  // Seed locations
  await dbRun(`
    INSERT INTO locations (id, name, hours, address) 
    VALUES 
    ('caton', 'Catons Café', '8:00 - 20:00', 'Campus Center'),
    ('dunk', 'Dunkin'' @ Commons', '7:00 - 17:00', 'Commons'),
    ('yummy', 'Yummy Noodles', '11:00 - 22:00', 'Science & Engineering')
  `);

  // Seed menu items
  await dbRun(`
    INSERT INTO menu_items (id, location_id, name, description, price, category) 
    VALUES 
    ('c1', 'caton', 'Chicken Wrap', 'Grilled chicken, lettuce, sauce', 7.5, 'main'),
    ('c2', 'caton', 'Veggie Salad', 'Greens, tomato, vinaigrette', 6.0, 'main'),
    ('d1', 'dunk', 'Coffee (16 oz)', 'Fresh brewed', 2.5, 'beverage'),
    ('d2', 'dunk', 'Bagel', 'Plain or everything', 1.99, 'bakery'),
    ('y1', 'yummy', 'Beef Ramen', 'Savory broth, noodles', 9.0, 'main'),
    ('y2', 'yummy', 'Veggie Stir Fry', 'Seasonal veggies, rice', 8.0, 'main')
  `);

  // Seed drop-off locations
  await dbRun(`
    INSERT INTO drop_off_locations (code, name) 
    VALUES 
    ('SH', 'Sherman Hall'),
    ('CC', 'Campus Center'),
    ('ENG', 'Engineering Building')
  `);

  console.log('✓ Database seeded successfully');
}

