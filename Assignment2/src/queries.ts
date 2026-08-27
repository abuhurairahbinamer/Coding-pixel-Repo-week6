import { AppDataSource } from "./data-source";
import { Task } from "./entities/Task";
import { User } from "./entities/User";
import { TaskStatus } from "./entities/enums";

export type TaskStatusCount = {
  status: string;
  count: number;
};

export type UserTaskCount = {
  userId: number;
  name: string;
  taskCount: number;
};

export type UserCompletedCount = {
  userId: number;
  name: string;
  done: number;
};

type RawTaskStatusCount = {
  status: string;
  count: string;
};

type RawUserTaskCount = {
  userId: number;
  name: string;
  taskCount: string;
};

type RawUserCompletedCount = {
  userId: number;
  name: string;
  done: string;
};

// Q1: Tasks for one project, due dates ascending and NULL dates last.
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .where("task.projectId = :projectId", { projectId })
    .orderBy("task.dueDate", "ASC", "NULLS LAST")
    .addOrderBy("task.id", "ASC")
    .getMany();
}

// Q2: Number of tasks in each status.
export async function countTasksByStatus(): Promise<TaskStatusCount[]> {
  const rows = await AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .select("task.status", "status")
    .addSelect("COUNT(task.id)", "count")
    .groupBy("task.status")
    .orderBy("task.status", "ASC")
    .getRawMany<RawTaskStatusCount>();

  return rows.map((row) => ({
    status: row.status,
    count: Number(row.count),
  }));
}

// Q3: Every user, including users who have zero assigned tasks.
export async function getUsersWithTaskCounts(): Promise<UserTaskCount[]> {
  const rows = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .leftJoin("user.assignedTasks", "task")
    .select("user.id", "userId")
    .addSelect("user.name", "name")
    .addSelect("COUNT(task.id)", "taskCount")
    .groupBy("user.id")
    .addGroupBy("user.name")
    .orderBy("user.id", "ASC")
    .getRawMany<RawUserTaskCount>();

  return rows.map((row) => ({
    userId: Number(row.userId),
    name: row.name,
    taskCount: Number(row.taskCount),
  }));
}

// Q4: Tasks carrying the requested tag.
export async function getTasksByTag(tagName: string): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .innerJoin("task.tags", "tag")
    .where("tag.name = :tagName", { tagName })
    .orderBy("task.id", "ASC")
    .getMany();
}

// Q5: Overdue, unfinished, assigned tasks with the assignee loaded.
export async function getOverdueTasks(): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .innerJoinAndSelect("task.assignee", "assignee")
    .where("task.dueDate < CURRENT_DATE")
    .andWhere("task.status <> :done", { done: TaskStatus.DONE })
    .orderBy("task.dueDate", "ASC")
    .addOrderBy("task.id", "ASC")
    .getMany();
}

// Q6: Users ordered by their number of completed tasks.
export async function getTopUsersByCompleted(
  limit: number,
): Promise<UserCompletedCount[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    return [];
  }

  const rows = await AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .innerJoin("user.assignedTasks", "task")
    .select("user.id", "userId")
    .addSelect("user.name", "name")
    .addSelect("COUNT(task.id)", "done")
    .where("task.status = :done", { done: TaskStatus.DONE })
    .groupBy("user.id")
    .addGroupBy("user.name")
    .orderBy("COUNT(task.id)", "DESC")
    .addOrderBy("user.id", "ASC")
    .limit(limit)
    .getRawMany<RawUserCompletedCount>();

  return rows.map((row) => ({
    userId: Number(row.userId),
    name: row.name,
    done: Number(row.done),
  }));
}
