import mongoose from 'mongoose';
import { Event } from '../models/Event';
import { connectDatabase } from '../config/database';

/**
 * Script to verify database indexes are created correctly
 * Run with: npm run verify-indexes
 */
async function verifyIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('Connected successfully!\n');

    // Get all indexes on the Event collection
    const indexes = await Event.collection.getIndexes();

    console.log('=== Event Collection Indexes ===\n');
    
    // Display each index
    Object.entries(indexes).forEach(([name, indexInfo]) => {
      console.log(`Index Name: ${name}`);
      console.log(`Keys:`, JSON.stringify(indexInfo, null, 2));
      console.log('---');
    });

    // Verify expected indexes exist
    const expectedIndexes = [
      { name: 'startTime_1_endTime_1', keys: { startTime: 1, endTime: 1 } },
      { name: 'startTime_1', keys: { startTime: 1 } },
      { name: 'endTime_1', keys: { endTime: 1 } },
    ];

    console.log('\n=== Index Verification ===\n');
    
    let allIndexesPresent = true;
    for (const expected of expectedIndexes) {
      const exists = indexes[expected.name];
      if (exists) {
        console.log(`✓ ${expected.name} - Present`);
      } else {
        console.log(`✗ ${expected.name} - Missing`);
        allIndexesPresent = false;
      }
    }

    if (allIndexesPresent) {
      console.log('\n✓ All expected indexes are present!');
    } else {
      console.log('\n✗ Some indexes are missing. They may need time to build.');
    }

    // Get collection stats
    const count = await Event.countDocuments();
    console.log('\n=== Collection Statistics ===\n');
    console.log(`Total Documents: ${count}`);
    console.log(`Total Indexes: ${Object.keys(indexes).length}`);

  } catch (error) {
    console.error('Error verifying indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

verifyIndexes();
