import { AppDataSource } from "./data-source";
import { Task } from "./entities/Task";
import { User } from "./entities/User";
import { ProjectRole, TaskStatus } from "./entities/enums";
import { Project } from "./entities/Project";
export type TaskStatusCount = {
  status: string;
  count: number;
};

export type UserTaskCount = {
  userId: number;
  name: string;
  taskCount: number;
};
export type AverageTagsPerTask = {
  averageTags: number;
};
export type UserCompletedCount = {
  userId: number;
  name: string;
  done: number;
};
export type TaskCommentCount = {
  taskId: number;
  title: string;
  commentCount: number;
};

type RawProjectMemberRole = {
  projectId: number;
  projectName: string;
  userId: number | null;
  userName: string | null;
  role: ProjectRole | null;
};

export type ProjectMemberRole = {
  projectId: number;
  projectName: string;
  userId: number | null;
  userName: string | null;
  role: ProjectRole | null;
};

type RawTaskCommentCount = {
  taskId: number;
  title: string;
  commentCount: string;
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

type RawAverageTagsPerTask = {
  averageTags: string | number | null;
};

//W2  Q1: Tasks for one project, due dates ascending and NULL dates last.
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .where("task.projectId = :projectId", { projectId })
    .orderBy("task.dueDate", "ASC", "NULLS LAST")
    .addOrderBy("task.id", "ASC")
    .getMany();
}

// C1 Q2: Number of tasks in each status.
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

//C2 Q3: Every user, including users who have zero assigned tasks.
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

//C3 Q4: Tasks carrying the requested tag.
export async function getTasksByTag(tagName: string): Promise<Task[]> {
  return AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .innerJoin("task.tags", "tag")
    .where("tag.name = :tagName", { tagName })
    .orderBy("task.id", "ASC")
    .getMany();
}

//C3 Q5: Overdue, unfinished, assigned tasks with the assignee loaded.
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

//C4 Q6: Users ordered by their number of completed tasks.
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



// Q7: Projects that have no tasks.
export async function getProjectsWithoutTasks(): Promise<Project[]> {
  return AppDataSource.getRepository(Project)
    .createQueryBuilder("project")
    .where((queryBuilder) => {
      const taskExists = queryBuilder
        .subQuery()
        .select("1")
        .from(Task, "task")
        .where("task.projectId = project.id")
        .getQuery();

      return `NOT EXISTS ${taskExists}`;
    })
    .orderBy("project.id", "ASC")
    .getMany();
}

// Q8: Average number of tags per task, including tasks with zero tags.
export async function getAverageTagsPerTask(): Promise<AverageTagsPerTask> {
  const row = await AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoin("task.tags", "tag")
    .select(
      "COUNT(tag.id)::float / NULLIF(COUNT(DISTINCT task.id), 0)",
      "averageTags",
    )
    .getRawOne<RawAverageTagsPerTask>();

  return {
    averageTags: row?.averageTags == null ? 0 : Number(row.averageTags),
  };
}

// Q9: Number of comments per task, highest first, including zero.
export async function getCommentsPerTask(): Promise<TaskCommentCount[]> {
  const rows = await AppDataSource.getRepository(Task)
    .createQueryBuilder("task")
    .leftJoin("task.comments", "comment")
    .select("task.id", "taskId")
    .addSelect("task.title", "title")
    .addSelect("COUNT(comment.id)", "commentCount")
    .groupBy("task.id")
    .addGroupBy("task.title")
    .orderBy("COUNT(comment.id)", "DESC")
    .addOrderBy("task.id", "ASC")
    .getRawMany<RawTaskCommentCount>();

  return rows.map((row) => ({
    taskId: Number(row.taskId),
    title: row.title,
    commentCount: Number(row.commentCount),
  }));
}

// Q10: Every project with its members and their roles.
export async function getProjectsWithMembers(): Promise<ProjectMemberRole[]> {
  const rows = await AppDataSource.getRepository(Project)
    .createQueryBuilder("project")
    .leftJoin("project.members", "membership")
    .leftJoin("membership.user", "user")
    .select("project.id", "projectId")
    .addSelect("project.name", "projectName")
    .addSelect("user.id", "userId")
    .addSelect("user.name", "userName")
    .addSelect("membership.role", "role")
    .orderBy("project.id", "ASC")
    .addOrderBy("user.id", "ASC")
    .getRawMany<RawProjectMemberRole>();

  return rows.map((row) => ({
    projectId: Number(row.projectId),
    projectName: row.projectName,
    userId: row.userId == null ? null : Number(row.userId),
    userName: row.userName,
    role: row.role,
  }));
}
