import "reflect-metadata";
import { AppDataSource } from "./data-source";
import {
  getTasksByProject,
  countTasksByStatus,
  getUsersWithTaskCounts,
  getTasksByTag,
  getOverdueTasks,
  getTopUsersByCompleted,
  getProjectsWithoutTasks,
  getAverageTagsPerTask,
  getCommentsPerTask,
  getProjectsWithMembers,
} from "./queries";

async function runQueries(): Promise<void> {
  await AppDataSource.initialize();

  try {
    // W2 — Q1
    console.log(
      "W2 — Q1: Tasks by project",
      await getTasksByProject(1),
    );

    // C1 — Q2
    console.log(
      "C1 — Q2: Task counts by status",
      await countTasksByStatus(),
    );

    // C2 — Q3
    console.log(
      "C2 — Q3: Users with task counts",
      await getUsersWithTaskCounts(),
    );

    // C3 — Q4
    console.log(
      "C3 — Q4: Tasks with database tag",
      await getTasksByTag("database"),
    );

    // C3 — Q5
    console.log(
      "C3 — Q5: Overdue tasks",
      await getOverdueTasks(),
    );

    // C4 — Q6
    console.log(
      "C4 — Q6: Top 3 users by completed tasks",
      await getTopUsersByCompleted(3),
    );

    // X1 — Q7
    console.log(
      "X1 — Q7: Projects without tasks",
      await getProjectsWithoutTasks(),
    );

    // X1 — Q8
    console.log(
      "X1 — Q8: Average tags per task",
      await getAverageTagsPerTask(),
    );

    // X1 — Q9
    console.log(
      "X1 — Q9: Comments per task",
      await getCommentsPerTask(),
    );

    // X1 — Q10
    console.log(
      "X1 — Q10: Projects with members",
      await getProjectsWithMembers(),
    );
  } finally {
    await AppDataSource.destroy();
  }
}

runQueries().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : String(error);

  console.error("Query execution failed:", message);
  process.exitCode = 1;
});