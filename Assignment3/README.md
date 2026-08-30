# CMIT Full-Stack Internship — Week 6: Assignment 3
## Advanced Queries, Pagination & The N+1 Problem

### Project Overview
This repository contains the complete implementation for **Week 6 Assignment 3**, covering:
- **Warm-Up (W1, W2)**: Offset-based pagination with `getManyAndCount()` and empirical identification of the N+1 problem through query tracking.
- **Core (C1, C2, C3)**: Single-query relation loading using `leftJoinAndSelect`, resolving the N+1 problem, and paginated collection joins with distinct total count preservation.
- **Challenge (X1, X2, X3)**: High-volume scale benchmark on 500 tasks (501 queries vs 1 query), comparative analysis of 3 relation loading methods (`relations`, `leftJoinAndSelect`, `loadRelationCountAndMap`), and keyset / cursor-based pagination.

---

### Project Structure
```
Assignment3/
+-- src/
¦   +-- entities/
¦   ¦   +-- Comment.ts
¦   ¦   +-- enums.ts
¦   ¦   +-- Project.ts
¦   ¦   +-- ProjectMember.ts
¦   ¦   +-- Tag.ts
¦   ¦   +-- Task.ts
¦   ¦   +-- User.ts
¦   +-- migrations/
¦   ¦   +-- 1787656797093-InitialSchema.ts
¦   ¦   +-- 1787664050166-AddTaskIndexes.ts
¦   +-- data-source.ts
¦   +-- query-tracker.ts
¦   +-- queries.ts
¦   +-- seed.ts
¦   +-- run-benchmarks.ts
+-- .env.example
+-- NOTES.md
+-- package.json
+-- tsconfig.json
+-- README.md
```

---

### Prerequisites & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create `.env` using `.env.example`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=assignment1
   ```

3. **Run Migrations:**
   ```bash
   npm run migration:run
   ```

4. **Seed Database:**
   ```bash
   npm run seed
   ```

5. **Type Check:**
   ```bash
   npm run typecheck
   ```

6. **Run Full Benchmarks & Test Suite:**
   ```bash
   npm run queries
   ```

---

### Deliverables & Verifications
- **`NOTES.md`**: Contains detailed analysis, query counts, exact SQL logs, and architectural comparisons for Warm-Up, Core, and Challenge sections.
- **`src/queries.ts`**: Contains all typed query functions with strict TypeScript and 0 `any` annotations.
- **`src/run-benchmarks.ts`**: Benchmark script verifying all acceptance criteria.
