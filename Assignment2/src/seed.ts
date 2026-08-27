import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Comment } from "./entities/Comment";
import { Project } from "./entities/Project";
import { ProjectMember } from "./entities/ProjectMember";
import { Tag } from "./entities/Tag";
import { Task } from "./entities/Task";
import { User } from "./entities/User";
import { ProjectRole, TaskStatus } from "./entities/enums";

function dateFromToday(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function seedDatabase(): Promise<void> {
  const openedConnection = !AppDataSource.isInitialized;

  if (openedConnection) {
    await AppDataSource.initialize();
  }

  try {
    await AppDataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const projectRepository = manager.getRepository(Project);
      const projectMemberRepository = manager.getRepository(ProjectMember);
      const tagRepository = manager.getRepository(Tag);
      const taskRepository = manager.getRepository(Task);
      const commentRepository = manager.getRepository(Comment);
    //W1 Task  
      const users = await userRepository.save(
        userRepository.create([
          { name: "Ali Khan", email: "ali@example.com" },
          { name: "Sara Ahmed", email: "sara@example.com" },
          { name: "Usman Malik", email: "usman@example.com" },
          { name: "Ayesha Noor", email: "ayesha@example.com" },
          { name: "Hamza Iqbal", email: "hamza@example.com" },
          { name: "Fatima Raza", email: "fatima@example.com" },
        ]),
      );

      const [ali, sara, usman, ayesha, hamza, fatima] = users;
    // W1 Task
      const projects = await projectRepository.save(
        projectRepository.create([
          { name: "Task Management API", ownerId: ali.id },
          { name: "Intern Portal", ownerId: sara.id },
          { name: "Future Project", ownerId: usman.id },
        ]),
      );

      const [taskManagement, internPortal, futureProject] = projects;
     // W1
      await projectMemberRepository.save(
        projectMemberRepository.create([
          {
            userId: ali.id,
            projectId: taskManagement.id,
            role: ProjectRole.OWNER,
          },
          {
            userId: sara.id,
            projectId: taskManagement.id,
            role: ProjectRole.ADMIN,
          },
          {
            userId: usman.id,
            projectId: taskManagement.id,
            role: ProjectRole.MEMBER,
          },
          {
            userId: sara.id,
            projectId: internPortal.id,
            role: ProjectRole.OWNER,
          },
          {
            userId: ayesha.id,
            projectId: internPortal.id,
            role: ProjectRole.MEMBER,
          },
          {
            userId: usman.id,
            projectId: futureProject.id,
            role: ProjectRole.OWNER,
          },
          {
            userId: fatima.id,
            projectId: futureProject.id,
            role: ProjectRole.VIEWER,
          },
        ]),
      );

      const tags = await tagRepository.save(
        tagRepository.create([
          { name: "backend" },
          { name: "database" },
          { name: "urgent" },
          { name: "frontend" },
          { name: "bug" },
          { name: "documentation" },
        ]),
      );

      const [backend, database, urgent, frontend, bug, documentation] = tags;
     // W1
      const tasks = await taskRepository.save(
        taskRepository.create([
          {
            title: "Design task schema",
            description: "Design the database tables and constraints.",
            status: TaskStatus.TODO,
            priority: 5,
            projectId: taskManagement.id,
            assigneeId: sara.id,
            dueDate: dateFromToday(-10),
            tags: [database, urgent],
          },
          {
            title: "Create task endpoints",
            description: "Implement the task API endpoints.",
            status: TaskStatus.IN_PROGRESS,
            priority: 4,
            projectId: taskManagement.id,
            assigneeId: usman.id,
            dueDate: dateFromToday(5),
            tags: [backend, database],
          },
          {
            title: "Add database migration",
            description: "Generate and verify the initial migration.",
            status: TaskStatus.DONE,
            priority: 5,
            projectId: taskManagement.id,
            assigneeId: sara.id,
            dueDate: dateFromToday(-8),
            tags: [database],
          },
          {
            title: "Write setup guide",
            description: "Document the local setup process.",
            status: TaskStatus.TODO,
            priority: 2,
            projectId: taskManagement.id,
            assigneeId: null,
            dueDate: null,
            tags: [documentation],
          },
          {
            title: "Build task form",
            description: "Create the task creation form.",
            status: TaskStatus.DONE,
            priority: 3,
            projectId: taskManagement.id,
            assigneeId: ali.id,
            dueDate: dateFromToday(2),
            tags: [frontend, bug],
          },
          {
            title: "Fix authorization",
            description: "Correct project role authorization.",
            status: TaskStatus.IN_PROGRESS,
            priority: 5,
            projectId: taskManagement.id,
            assigneeId: ayesha.id,
            dueDate: dateFromToday(-3),
            tags: [backend, urgent],
          },
          {
            title: "Improve task list",
            description: "Improve the task list user interface.",
            status: TaskStatus.TODO,
            priority: 2,
            projectId: taskManagement.id,
            assigneeId: hamza.id,
            dueDate: dateFromToday(8),
            tags: [frontend],
          },
          {
            title: "Review task module",
            description: "Review the completed task module.",
            status: TaskStatus.DONE,
            priority: 1,
            projectId: taskManagement.id,
            assigneeId: usman.id,
            dueDate: null,
            tags: [],
          },
          {
            title: "Repair login flow",
            description: "Fix the portal login failure.",
            status: TaskStatus.TODO,
            priority: 5,
            projectId: internPortal.id,
            assigneeId: ayesha.id,
            dueDate: dateFromToday(-7),
            tags: [database, bug],
          },
          {
            title: "Create profile API",
            description: "Implement profile management endpoints.",
            status: TaskStatus.IN_PROGRESS,
            priority: 4,
            projectId: internPortal.id,
            assigneeId: sara.id,
            dueDate: dateFromToday(6),
            tags: [backend],
          },
          {
            title: "Resolve enrollment issue",
            description: "Resolve the enrollment validation issue.",
            status: TaskStatus.DONE,
            priority: 4,
            projectId: internPortal.id,
            assigneeId: hamza.id,
            dueDate: dateFromToday(-5),
            tags: [urgent, database],
          },
          {
            title: "Document portal routes",
            description: "Document the routes used by the portal.",
            status: TaskStatus.TODO,
            priority: 2,
            projectId: internPortal.id,
            assigneeId: ali.id,
            dueDate: null,
            tags: [documentation, frontend],
          },
          {
            title: "Test registration form",
            description: "Test the registration form validations.",
            status: TaskStatus.DONE,
            priority: 3,
            projectId: internPortal.id,
            assigneeId: ayesha.id,
            dueDate: dateFromToday(3),
            tags: [bug],
          },
          {
            title: "Optimize portal queries",
            description: "Improve slow portal database queries.",
            status: TaskStatus.IN_PROGRESS,
            priority: 5,
            projectId: internPortal.id,
            assigneeId: usman.id,
            dueDate: dateFromToday(-2),
            tags: [backend, database],
          },
          {
            title: "Polish dashboard",
            description: "Improve the dashboard presentation.",
            status: TaskStatus.TODO,
            priority: 2,
            projectId: internPortal.id,
            assigneeId: sara.id,
            dueDate: dateFromToday(10),
            tags: [frontend],
          },
        ]),
      );
      // W1 Task
      await commentRepository.save(
        commentRepository.create([
          {
            taskId: tasks[0].id,
            authorId: ali.id,
            body: "Please complete this before the API work starts.",
          },
          {
            taskId: tasks[0].id,
            authorId: sara.id,
            body: "The first schema draft is ready.",
          },
          {
            taskId: tasks[1].id,
            authorId: usman.id,
            body: "The create endpoint is complete.",
          },
          {
            taskId: tasks[2].id,
            authorId: ali.id,
            body: "Migration was tested successfully.",
          },
          {
            taskId: tasks[4].id,
            authorId: hamza.id,
            body: "The validation message needs improvement.",
          },
          {
            taskId: tasks[5].id,
            authorId: ayesha.id,
            body: "I reproduced the authorization problem.",
          },
          {
            taskId: tasks[8].id,
            authorId: sara.id,
            body: "This blocks intern access.",
          },
          {
            taskId: tasks[8].id,
            authorId: ayesha.id,
            body: "A fix is being tested.",
          },
          {
            taskId: tasks[9].id,
            authorId: usman.id,
            body: "The endpoint contract is documented.",
          },
          {
            taskId: tasks[13].id,
            authorId: ali.id,
            body: "Please include the query plan in the PR.",
          },
        ]),
      );
    });

    console.log("Seed completed successfully.");
  } finally {
    if (openedConnection && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  seedDatabase().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Seed failed:", message);
    process.exitCode = 1;
  });
}
