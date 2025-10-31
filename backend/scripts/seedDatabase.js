import { initDatabase, seedDatabase } from '../database/initDatabase.js';

async function main() {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

main();

