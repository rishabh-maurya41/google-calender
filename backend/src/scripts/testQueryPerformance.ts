import mongoose from 'mongoose';
import { Event } from '../models/Event';
import { connectDatabase } from '../config/database';

/**
 * Script to test query performance with indexes
 * Run with: npm run test-performance
 */
async function testQueryPerformance() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDatabase();
    console.log('Connected successfully!\n');

    // Test query: Get events for a week range
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');

    console.log('=== Query Performance Test ===\n');
    console.log(`Query: Events between ${startDate.toISOString()} and ${endDate.toISOString()}\n`);

    // Run query with explain to see execution stats
    const explainResult: any = await Event.find({
      $and: [
        { endTime: { $gte: startDate } },
        { startTime: { $lte: endDate } }
      ]
    })
    .sort({ startTime: 1 })
    .explain('executionStats');

    const executionStats = explainResult.executionStats;

    console.log('=== Execution Statistics ===\n');
    console.log(`Execution Time: ${executionStats.executionTimeMillis} ms`);
    console.log(`Documents Examined: ${executionStats.totalDocsExamined}`);
    console.log(`Documents Returned: ${executionStats.nReturned}`);
    console.log(`Index Used: ${executionStats.executionStages.indexName || 'No index (collection scan)'}`);
    
    // Calculate efficiency
    const efficiency = executionStats.totalDocsExamined > 0 
      ? ((executionStats.nReturned / executionStats.totalDocsExamined) * 100).toFixed(2)
      : 'N/A';
    
    console.log(`Query Efficiency: ${efficiency}%`);
    
    if (executionStats.executionStages.indexName) {
      console.log('\n✓ Query is using an index - Good performance!');
    } else {
      console.log('\n⚠ Query is NOT using an index - Performance may be slow with large datasets');
    }

    // Run actual query to get results
    const startTime = Date.now();
    const events = await Event.find({
      $and: [
        { endTime: { $gte: startDate } },
        { startTime: { $lte: endDate } }
      ]
    }).sort({ startTime: 1 });
    const queryTime = Date.now() - startTime;

    console.log(`\nActual Query Time: ${queryTime} ms`);
    console.log(`Events Found: ${events.length}`);

    // Performance recommendations
    console.log('\n=== Performance Recommendations ===\n');
    if (executionStats.executionTimeMillis < 10) {
      console.log('✓ Excellent performance');
    } else if (executionStats.executionTimeMillis < 100) {
      console.log('✓ Good performance');
    } else {
      console.log('⚠ Consider optimizing indexes or query structure');
    }

    if (efficiency !== 'N/A' && parseFloat(efficiency) < 50) {
      console.log('⚠ Low query efficiency - indexes may not be optimal');
    }

  } catch (error) {
    console.error('Error testing query performance:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

testQueryPerformance();
