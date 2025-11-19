# Database Scripts

This directory contains utility scripts for database management and performance testing.

## Available Scripts

### Verify Indexes

Verifies that all database indexes are created correctly on the Event collection.

```bash
npm run verify-indexes
```

**What it does:**
- Connects to MongoDB
- Lists all indexes on the Event collection
- Verifies that expected indexes exist:
  - `startTime_1_endTime_1` - Compound index for range queries
  - `startTime_1` - Individual index for start time queries
  - `endTime_1` - Individual index for end time queries
- Shows collection statistics

**Expected Output:**
```
=== Event Collection Indexes ===

Index Name: _id_
Keys: { "_id": 1 }
---
Index Name: startTime_1_endTime_1
Keys: { "startTime": 1, "endTime": 1 }
---
Index Name: startTime_1
Keys: { "startTime": 1 }
---
Index Name: endTime_1
Keys: { "endTime": 1 }
---

=== Index Verification ===

✓ startTime_1_endTime_1 - Present
✓ startTime_1 - Present
✓ endTime_1 - Present

✓ All expected indexes are present!
```

### Test Query Performance

Tests the performance of date range queries and verifies that indexes are being used.

```bash
npm run test-performance
```

**What it does:**
- Connects to MongoDB
- Runs a sample query to fetch events for a week
- Uses MongoDB's `explain()` to analyze query execution
- Reports execution time, documents examined, and index usage
- Provides performance recommendations

**Expected Output:**
```
=== Query Performance Test ===

Query: Events between 2024-01-01T00:00:00.000Z and 2024-01-07T00:00:00.000Z

=== Execution Statistics ===

Execution Time: 2 ms
Documents Examined: 5
Documents Returned: 5
Index Used: startTime_1_endTime_1
Query Efficiency: 100.00%

✓ Query is using an index - Good performance!

Actual Query Time: 15 ms
Events Found: 5

=== Performance Recommendations ===

✓ Excellent performance
```

## Index Strategy

The Event collection uses three indexes for optimal query performance:

1. **Compound Index: `{ startTime: 1, endTime: 1 }`**
   - Primary index for range queries
   - Supports queries that filter by both start and end times
   - Used by the main `getEvents` query: `{ endTime: { $gte: date }, startTime: { $lte: date } }`
   - Also supports sorting by `startTime`

2. **Individual Index: `{ startTime: 1 }`**
   - Optimizes queries that only filter or sort by start time
   - Provides flexibility for future query patterns

3. **Individual Index: `{ endTime: 1 }`**
   - Optimizes queries that only filter by end time
   - Provides flexibility for future query patterns

## Performance Benefits

With proper indexing:
- Query execution time: **< 10ms** for typical week-range queries
- Index usage: **100%** (all queries use indexes, no collection scans)
- Scalability: Performance remains consistent even with thousands of events

Without indexes:
- Query execution time: **50-500ms+** depending on collection size
- MongoDB must scan entire collection for each query
- Performance degrades linearly with data growth

## Troubleshooting

### Indexes Not Created

If indexes are missing after running `verify-indexes`:

1. Ensure MongoDB is running and accessible
2. Check that the application has connected to the database at least once
3. Indexes are created automatically when the Mongoose model is first used
4. Try starting the server (`npm run dev`) to trigger index creation

### Poor Query Performance

If `test-performance` shows slow queries:

1. Verify indexes exist using `verify-indexes`
2. Check that queries are using the correct index
3. Ensure MongoDB has sufficient resources (RAM, CPU)
4. Consider adding more specific indexes for your query patterns

## Requirements Addressed

These scripts help verify implementation of:
- **Requirement 1.5**: Fast event fetching for week view
- **Requirement 5.2**: Efficient week navigation queries
- **Requirement 5.3**: Quick response when loading different weeks
