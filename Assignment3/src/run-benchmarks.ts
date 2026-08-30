import { AppDataSource } from "./data-source";
import { queryTracker } from "./query-tracker";
import {
  listTasks,
  listTasksNaiveWithProject,
  getTasksWithRelations,
  listTasksWithRelationsPaginated,
  loadTasksWithRelationsOption,
  loadTasksWithLeftJoin,
  loadTasksWithCommentCount,
  listTasksCursor,
} from "./queries";
import { seedDatabase, seedLargeDataset, resetToStandardSeed } from "./seed";
import { Task } from "./entities/Task";

async function main(): Promise<void> {
  console.log("===============================================================");
  console.log("   CMIT WEEK 6 - ASSIGNMENT 3 BENCHMARKS & VERIFICATION        ");
  console.log("===============================================================\n");

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  // Ensure clean standard seed
  console.log("[Setup] Resetting to standard seed...");
  await resetToStandardSeed();

  // ---------------------------------------------------------------------------
  // WARM-UP 1 (W1): listTasks({ page, pageSize }) using take and skip
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [W1] Testing Offset Pagination: listTasks({ page, pageSize })");
  console.log("---------------------------------------------------------------");
  queryTracker.startTracking(true);
  const page1 = await listTasks({ page: 1, pageSize: 5 });
  const page2 = await listTasks({ page: 2, pageSize: 5 });
  const w1Queries = queryTracker.stopTracking();

  console.log(`Page 1: Returned ${page1.items.length} items (IDs: ${page1.items.map(i => i.id).join(", ")}) | total: ${page1.total}`);
  console.log(`Page 2: Returned ${page2.items.length} items (IDs: ${page2.items.map(i => i.id).join(", ")}) | total: ${page2.total}`);
  console.log(`Total count reported: ${page1.total} (matches total tasks)`);

  const page1Ids = new Set(page1.items.map(t => t.id));
  const hasOverlap = page2.items.some(t => page1Ids.has(t.id));
  console.log(`[Check W1] Page 2 distinct from Page 1? ${!hasOverlap ? "PASSED" : "FAILED"}`);
  console.log(`[Check W1] Total is overall count (15) instead of pageSize (5)? ${page1.total === 15 ? "PASSED" : "FAILED"}`);

  // ---------------------------------------------------------------------------
  // WARM-UP 2 (W2): Count queries for Naive Relation Load (N+1 Problem)
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [W2] Testing Naive N+1 Relation Loading (1 + N queries)");
  console.log("---------------------------------------------------------------");
  queryTracker.startTracking(false);
  const naiveStart = performance.now();
  const naiveResults = await listTasksNaiveWithProject();
  const naiveDuration = (performance.now() - naiveStart).toFixed(2);
  const naiveQueries = queryTracker.stopTracking();

  console.log(`Loaded ${naiveResults.length} tasks with projects.`);
  console.log(`Total queries fired: ${naiveQueries.length}`);
  console.log(`Query #1 (The '1'): ${naiveQueries[0]}`);
  console.log(`Query #2 (First of the 'N'): ${naiveQueries[1]}`);
  console.log(`Query #${naiveQueries.length} (Last of the 'N'): ${naiveQueries[naiveQueries.length - 1]}`);
  console.log(`Execution time: ${naiveDuration}ms`);
  console.log(`[Check W2] Fired exactly 1 + N (1 + ${naiveResults.length} = ${1 + naiveResults.length}) queries? ${naiveQueries.length === 1 + naiveResults.length ? "PASSED" : "FAILED"}`);

  // ---------------------------------------------------------------------------
  // CORE 1 & 2 (C1, C2): Load tasks with project, assignee, and tags in 1 query
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [C1 & C2] Testing Eager Join Loading (Fixed N+1 with leftJoinAndSelect)");
  console.log("---------------------------------------------------------------");
  queryTracker.startTracking(true);
  const eagerStart = performance.now();
  const eagerResults = await getTasksWithRelations();
  const eagerDuration = (performance.now() - eagerStart).toFixed(2);
  const eagerQueries = queryTracker.stopTracking();

  console.log(`Loaded ${eagerResults.length} tasks with project, assignee, and tags.`);
  console.log(`Total queries fired: ${eagerQueries.length}`);
  console.log(`Execution time: ${eagerDuration}ms`);

  const allRelationsHydrated = eagerResults.every(
    t => t.project !== undefined && t.assignee !== undefined && Array.isArray(t.tags)
  );
  console.log(`[Check C1] All 3 relations (project, assignee, tags) populated on all items? ${allRelationsHydrated ? "PASSED" : "FAILED"}`);
  console.log(`[Check C2] Query count reduced from ${naiveQueries.length} to ${eagerQueries.length}? ${eagerQueries.length === 1 ? "PASSED" : "FAILED"}`);

  // ---------------------------------------------------------------------------
  // CORE 3 (C3): Paginated collection join (tags) & verifying total count
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [C3] Testing Paginated Collection Joins (take + skip with ManyToMany tags)");
  console.log("---------------------------------------------------------------");
  queryTracker.startTracking(true);
  const paginatedJoinedP1 = await listTasksWithRelationsPaginated({ page: 1, pageSize: 5 });
  const paginatedJoinedP2 = await listTasksWithRelationsPaginated({ page: 2, pageSize: 5 });
  const c3Queries = queryTracker.stopTracking();

  console.log(`Page 1: ${paginatedJoinedP1.items.length} tasks | Total reported: ${paginatedJoinedP1.total}`);
  console.log(`Page 2: ${paginatedJoinedP2.items.length} tasks | Total reported: ${paginatedJoinedP2.total}`);
  console.log(`Queries executed for paginated collection join: ${c3Queries.length}`);
  console.log(`[Check C3] Total matches distinct task count (15) instead of multiplied joined rows? ${paginatedJoinedP1.total === 15 ? "PASSED" : "FAILED"}`);

  // ---------------------------------------------------------------------------
  // CHALLENGE 1 (X1): Large Dataset Scale Test (500 tasks)
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [X1] Challenge: Scale Benchmark on 500 Tasks");
  console.log("---------------------------------------------------------------");
  console.log("Seeding 500 total tasks...");
  await seedLargeDataset(500);

  console.log("\n1. Measuring Naive Relation Load on 500 Tasks:");
  queryTracker.startTracking(false);
  const largeNaiveStart = performance.now();
  const largeNaiveResults = await listTasksNaiveWithProject();
  const largeNaiveDuration = (performance.now() - largeNaiveStart).toFixed(2);
  const largeNaiveQueries = queryTracker.stopTracking();
  console.log(`   - Tasks processed: ${largeNaiveResults.length}`);
  console.log(`   - Queries fired: ${largeNaiveQueries.length} (1 list query + ${largeNaiveResults.length} relation queries)`);
  console.log(`   - Execution time: ${largeNaiveDuration} ms`);

  console.log("\n2. Measuring Single Join Load on 500 Tasks:");
  queryTracker.startTracking(false);
  const largeJoinedStart = performance.now();
  const largeJoinedResults = await getTasksWithRelations();
  const largeJoinedDuration = (performance.now() - largeJoinedStart).toFixed(2);
  const largeJoinedQueries = queryTracker.stopTracking();
  console.log(`   - Tasks processed: ${largeJoinedResults.length}`);
  console.log(`   - Queries fired: ${largeJoinedQueries.length}`);
  console.log(`   - Execution time: ${largeJoinedDuration} ms`);

  console.log(`[Check X1] 500 tasks naive fires ~501 queries and join fires 1 query? ${largeNaiveQueries.length >= 501 && largeJoinedQueries.length === 1 ? "PASSED" : "FAILED"}`);

  // ---------------------------------------------------------------------------
  // CHALLENGE 2 (X2): Compare 3 Ways of Loading Related Data
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [X2] Challenge: Comparing 3 Ways of Loading Related Data");
  console.log("---------------------------------------------------------------");

  // Method 1: Repository find({ relations })
  queryTracker.startTracking(true);
  const m1Start = performance.now();
  const m1Results = await loadTasksWithRelationsOption();
  const m1Duration = (performance.now() - m1Start).toFixed(2);
  const m1Queries = queryTracker.stopTracking();
  console.log(`\nMethod 1: repository.find({ relations })`);
  console.log(`  - Items: ${m1Results.length}, Queries: ${m1Queries.length}, Time: ${m1Duration}ms`);

  // Method 2: QueryBuilder leftJoinAndSelect
  queryTracker.startTracking(true);
  const m2Start = performance.now();
  const m2Results = await loadTasksWithLeftJoin();
  const m2Duration = (performance.now() - m2Start).toFixed(2);
  const m2Queries = queryTracker.stopTracking();
  console.log(`\nMethod 2: QueryBuilder leftJoinAndSelect`);
  console.log(`  - Items: ${m2Results.length}, Queries: ${m2Queries.length}, Time: ${m2Duration}ms`);

  // Method 3: QueryBuilder loadRelationCountAndMap
  queryTracker.startTracking(true);
  const m3Start = performance.now();
  const m3Results = await loadTasksWithCommentCount();
  const m3Duration = (performance.now() - m3Start).toFixed(2);
  const m3Queries = queryTracker.stopTracking();
  console.log(`\nMethod 3: QueryBuilder loadRelationCountAndMap`);
  console.log(`  - Items: ${m3Results.length}, Queries: ${m3Queries.length}, Time: ${m3Duration}ms`);
  console.log(`  - Sample Task #1 Comment Count: ${m3Results[0]?.commentCount ?? 0}`);

  // ---------------------------------------------------------------------------
  // CHALLENGE 3 (X3): Cursor-Based Pagination
  // ---------------------------------------------------------------------------
  console.log("\n---------------------------------------------------------------");
  console.log(">>> [X3] Challenge: Keyset / Cursor-Based Pagination");
  console.log("---------------------------------------------------------------");

  const pageSize = 50;
  let cursor: number | null = null;
  let hasMore = true;
  let cursorPage = 1;
  const allCursorFetchedIds: number[] = [];

  const cursorStart = performance.now();
  while (hasMore) {
    const pageResult = await listTasksCursor({ lastId: cursor, pageSize });
    allCursorFetchedIds.push(...pageResult.items.map(t => t.id));
    cursor = pageResult.nextCursor;
    hasMore = pageResult.hasMore;
    console.log(`Cursor Batch #${cursorPage}: retrieved ${pageResult.items.length} items (Last ID: ${cursor}, hasMore: ${hasMore})`);
    cursorPage++;
  }
  const cursorDuration = (performance.now() - cursorStart).toFixed(2);

  console.log(`\nTotal items traversed with cursor: ${allCursorFetchedIds.length}`);
  console.log(`Total time for full cursor traversal: ${cursorDuration}ms`);

  // Verify uniqueness and completeness
  const uniqueIds = new Set(allCursorFetchedIds);
  const hasDuplicates = uniqueIds.size !== allCursorFetchedIds.length;
  console.log(`[Check X3] Any duplicate IDs? ${hasDuplicates ? "FAILED" : "PASSED (0 duplicates)"}`);
  console.log(`[Check X3] All 500 tasks returned without gaps? ${uniqueIds.size === 500 ? "PASSED" : "FAILED"}`);

  // Clean up and reset back to standard seed
  console.log("\n[Cleanup] Restoring standard seed...");
  await resetToStandardSeed();

  console.log("\n===============================================================");
  console.log("           ALL ASSIGNMENT 3 CHECKS COMPLETED!                  ");
  console.log("===============================================================\n");

  await AppDataSource.destroy();
}

main().catch((error: unknown) => {
  console.error("Benchmark failed:", error);
  process.exitCode = 1;
});
