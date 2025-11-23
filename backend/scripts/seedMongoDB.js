import bcrypt from 'bcryptjs';
import { connectMongoDB, disconnectMongoDB } from '../database/mongodb.js';
import { User } from '../models/User.js';
import { Location } from '../models/Location.js';
import { MenuItem } from '../models/MenuItem.js';
import { DropOffLocation } from '../models/DropOffLocation.js';

async function seedDatabase() {
  console.log('🌱 Seeding MongoDB database...\n');

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Check if data already exists
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️  Found ${userCount} existing users. Checking for missing default users...`);
    }

    // Hash password for all users (password123)
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Seed users
    console.log('📝 Seeding users...');
    const users = [
      { email: 'student@umbc.edu', username: 'student', password_hash: passwordHash, role: 'customer', restaurant_location_id: null },
      { email: 'faculty@umbc.edu', username: 'faculty', password_hash: passwordHash, role: 'customer', restaurant_location_id: null },
      { email: 'driver1@umbc.edu', username: 'driver1', password_hash: passwordHash, role: 'driver', restaurant_location_id: null },
      { email: 'staff_caton@umbc.edu', username: 'staff_caton', password_hash: passwordHash, role: 'restaurant_staff', restaurant_location_id: 'caton' },
      { email: 'staff_dunk@umbc.edu', username: 'staff_dunk', password_hash: passwordHash, role: 'restaurant_staff', restaurant_location_id: 'dunk' },
      { email: 'admin@umbc.edu', username: 'admin', password_hash: adminPasswordHash, role: 'admin', restaurant_location_id: null }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }]
      });

      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`   ✓ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`   - User already exists: ${userData.username}`);
      }
    }

    // Seed locations
    console.log('\n📍 Seeding locations...');
    const locations = [
      { id: 'caton', name: 'Catons Café', hours: '8:00 - 20:00', address: 'Campus Center' },
      { id: 'dunk', name: 'Dunkin\' @ Commons', hours: '7:00 - 17:00', address: 'Commons' },
      { id: 'yummy', name: 'Yummy Noodles', hours: '11:00 - 22:00', address: 'Science & Engineering' }
    ];

    for (const locData of locations) {
      const existingLoc = await Location.findOne({ id: locData.id });
      if (!existingLoc) {
        const location = new Location(locData);
        await location.save();
        console.log(`   ✓ Created location: ${locData.name} (${locData.id})`);
      } else {
        console.log(`   - Location already exists: ${locData.name}`);
      }
    }

    // Seed menu items
    console.log('\n🍔 Seeding menu items...');
    const menuItems = [
      { id: 'c1', location_id: 'caton', name: 'Chicken Wrap', description: 'Grilled chicken, lettuce, sauce', price: 7.5, category: 'main' },
      { id: 'c2', location_id: 'caton', name: 'Veggie Salad', description: 'Greens, tomato, vinaigrette', price: 6.0, category: 'main' },
      { id: 'd1', location_id: 'dunk', name: 'Coffee (16 oz)', description: 'Fresh brewed', price: 2.5, category: 'beverage' },
      { id: 'd2', location_id: 'dunk', name: 'Bagel', description: 'Plain or everything', price: 1.99, category: 'bakery' },
      { id: 'y1', location_id: 'yummy', name: 'Beef Ramen', description: 'Savory broth, noodles', price: 9.0, category: 'main' },
      { id: 'y2', location_id: 'yummy', name: 'Veggie Stir Fry', description: 'Seasonal veggies, rice', price: 8.0, category: 'main' }
    ];

    for (const itemData of menuItems) {
      const existingItem = await MenuItem.findOne({ id: itemData.id });
      if (!existingItem) {
        const menuItem = new MenuItem(itemData);
        await menuItem.save();
        console.log(`   ✓ Created menu item: ${itemData.name} ($${itemData.price})`);
      } else {
        console.log(`   - Menu item already exists: ${itemData.name}`);
      }
    }

    // Seed drop-off locations
    console.log('\n📦 Seeding drop-off locations...');
    const dropOffs = [
      { code: 'SH', name: 'Sherman Hall' },
      { code: 'CC', name: 'Campus Center' },
      { code: 'ENG', name: 'Engineering Building' }
    ];

    for (const dropData of dropOffs) {
      const existingDrop = await DropOffLocation.findOne({ code: dropData.code });
      if (!existingDrop) {
        const dropOff = new DropOffLocation(dropData);
        await dropOff.save();
        console.log(`   ✓ Created drop-off: ${dropData.name} (${dropData.code})`);
      } else {
        console.log(`   - Drop-off already exists: ${dropData.name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${await User.countDocuments()} users`);
    console.log(`   - ${await Location.countDocuments()} locations`);
    console.log(`   - ${await MenuItem.countDocuments()} menu items`);
    console.log(`   - ${await DropOffLocation.countDocuments()} drop-off locations\n`);

    await disconnectMongoDB();
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    await disconnectMongoDB();
    process.exit(1);
  }
}

seedDatabase();

