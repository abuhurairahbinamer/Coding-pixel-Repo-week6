import { AppDataSource } from "./data-source";
import { Task } from "./entities/Task";
import { Project } from "./entities/Project";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
}

export interface CursorPaginationParams {
  lastId?: number | null;
  pageSize: number;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface TaskWithProjectPair {
  task: Task;
  project: Project | null;
}

/**
 * W1: Paginates tasks using take and skip, returning page items, total count, and current page.
 * Uses getManyAndCount() to ensure total represents all matching records across all pages.
 */
export async function listTasks({
  page,
  pageSize,
}: PaginationParams): Promise<PaginatedResult<Task>> {
  if (page < 1) {
    throw new Error("Page number must be greater than or equal to 1.");
  }
  if (pageSize < 1) {
    throw new Error("Page size must be greater than or equal to 1.");
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .orderBy("task.id", "ASC")
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  return {
    items,
    total,
    page,
  };
}

/**
 * W2: Demonstrates naive N+1 relation loading:
 * 1 query to list tasks + N queries (one per task) to fetch its associated project.
 */
export async function listTasksNaiveWithProject(): Promise<TaskWithProjectPair[]> {
  const taskRepo = AppDataSource.getRepository(Task);
  const projectRepo = AppDataSource.getRepository(Project);

  // 1: Initial query fetching all tasks
  const tasks = await taskRepo
    .createQueryBuilder("task")
    .orderBy("task.id", "ASC")
    .getMany();

  const results: TaskWithProjectPair[] = [];

  // + N: Looping through each task and firing an individual query for each project
  for (const task of tasks) {
    const project = await projectRepo.findOne({
      where: { id: task.projectId },
    });
    results.push({ task, project });
  }

  return results;
}

/**
 * C1 & C2: Loads tasks together with their project, assignee, and tags in a single query.
 * Solves the N+1 problem by utilizing leftJoinAndSelect.
 */
export async function getTasksWithRelations(): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .leftJoinAndSelect("task.assignee", "assignee")
    .leftJoinAndSelect("task.tags", "tag")
    .orderBy("task.id", "ASC")
    .getMany();
}

/**
 * C3: Combines offset pagination with many-to-many collection joins (tags)
 * and confirms total is distinct and correct.
 */
export async function listTasksWithRelationsPaginated({
  page,
  pageSize,
}: PaginationParams): Promise<PaginatedResult<Task>> {
  if (page < 1) {
    throw new Error("Page number must be greater than or equal to 1.");
  }
  if (pageSize < 1) {
    throw new Error("Page size must be greater than or equal to 1.");
  }

  const skip = (page - 1) * pageSize;

  const [items, total] = await AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .leftJoinAndSelect("task.assignee", "assignee")
    .leftJoinAndSelect("task.tags", "tag")
    .orderBy("task.id", "ASC")
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  return {
    items,
    total,
    page,
  };
}

/**
 * X2 (Method 1): Loading related data using repository find({ relations: ... }).
 */
export async function loadTasksWithRelationsOption(): Promise<Task[]> {
  return AppDataSource.getRepository(Task).find({
    relations: {
      project: true,
      assignee: true,
      tags: true,
    },
    order: {
      id: "ASC",
    },
  });
}

/**
 * X2 (Method 2): Loading related data using QueryBuilder leftJoinAndSelect.
 */
export async function loadTasksWithLeftJoin(): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .leftJoinAndSelect("task.assignee", "assignee")
    .leftJoinAndSelect("task.tags", "tag")
    .orderBy("task.id", "ASC")
    .getMany();
}

/**
 * X2 (Method 3): Loading tasks with relation count mapping (loadRelationCountAndMap).
 * Efficiently computes comment count without loading entire Comment entities.
 */
export async function loadTasksWithCommentCount(): Promise<(Task & { commentCount?: number })[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .loadRelationCountAndMap("task.commentCount", "task.comments")
    .orderBy("task.id", "ASC")
    .getMany() as Promise<(Task & { commentCount?: number })[]>;
}

/**
 * X3: Keyset / Cursor-based pagination using `WHERE id > :lastId ORDER BY id ASC LIMIT :pageSize`.
 * Eliminates OFFSET degradation on large datasets and guarantees stable, non-duplicating pagination.
 */
export async function listTasksCursor({
  lastId,
  pageSize,
}: CursorPaginationParams): Promise<CursorPaginatedResult<Task>> {
  if (pageSize < 1) {
    throw new Error("Page size must be greater than or equal to 1.");
  }

  const qb = AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoinAndSelect("task.project", "project")
    .leftJoinAndSelect("task.assignee", "assignee")
    .leftJoinAndSelect("task.tags", "tag")
    .orderBy("task.id", "ASC")
    .take(pageSize + 1); // fetch 1 extra item to determine if more items exist

  if (lastId != null && lastId > 0) {
    qb.where("task.id > :lastId", { lastId });
  }

  const results = await qb.getMany();
  const hasMore = results.length > pageSize;
  const items = hasMore ? results.slice(0, pageSize) : results;
  const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
