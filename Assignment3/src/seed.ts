import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Project } from "./entities/Project";
import { ProjectMember } from "./entities/ProjectMember";
import { Task } from "./entities/Task";
import { Tag } from "./entities/Tag";
import { Comment } from "./entities/Comment";
import { ProjectRole, TaskStatus } from "./entities/enums";

function dateFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
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
      const memberRepository = manager.getRepository(ProjectMember);
      const taskRepository = manager.getRepository(Task);
      const tagRepository = manager.getRepository(Tag);
      const commentRepository = manager.getRepository(Comment);

      // Seed 6 Users
      const userData = [
        { name: "Ali Khan", email: "ali@example.com" },
        { name: "Sara Ahmed", email: "sara@example.com" },
        { name: "Usman Tariq", email: "usman@example.com" },
        { name: "Ayesha Malik", email: "ayesha@example.com" },
        { name: "Hamza Raza", email: "hamza@example.com" },
        { name: "Zainab Bibi", email: "zainab@example.com" }, // 0 tasks assigned
      ];

      const users = await userData.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const existing = await userRepository.findOne({
          where: { email: item.email },
        });
        const user =
          existing ?? (await userRepository.save(userRepository.create(item)));
        acc.push(user);
        return acc;
      }, Promise.resolve<User[]>([]));

      const [ali, sara, usman, ayesha, hamza] = users;

      // Seed 3 Projects
      const projectData = [
        { name: "Task Management App", ownerId: ali.id },
        { name: "Intern Portal", ownerId: sara.id },
        { name: "Analytics Engine", ownerId: usman.id }, // 0 tasks
      ];

      const projects = await projectData.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const existing = await projectRepository.findOne({
          where: { name: item.name },
        });
        const project =
          existing ??
          (await projectRepository.save(projectRepository.create(item)));
        acc.push(project);
        return acc;
      }, Promise.resolve<Project[]>([]));

      const [taskManagement, internPortal] = projects;

      // Seed 6 Project Members
      const memberData = [
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
          role: ProjectRole.ADMIN,
        },
        {
          userId: hamza.id,
          projectId: internPortal.id,
          role: ProjectRole.VIEWER,
        },
      ];

      await memberData.reduce(async (prevPromise, item) => {
        await prevPromise;
        const existing = await memberRepository.findOne({
          where: { userId: item.userId, projectId: item.projectId },
        });
        if (!existing) {
          await memberRepository.save(memberRepository.create(item));
        }
      }, Promise.resolve());

      // Seed 6 Tags
      const tagData = [
        { name: "Backend" },
        { name: "Database" },
        { name: "Urgent" },
        { name: "Frontend" },
        { name: "Bug" },
        { name: "Documentation" },
      ];

      const tags = await tagData.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const existing = await tagRepository.findOne({
          where: { name: item.name },
        });
        const tag =
          existing ?? (await tagRepository.save(tagRepository.create(item)));
        acc.push(tag);
        return acc;
      }, Promise.resolve<Tag[]>([]));

      const [backend, database, urgent, frontend, bug, documentation] = tags;

      // Seed 15 Tasks with various statuses, assignees, dates, and tags
      const taskData = [
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
          assigneeId: null, // special case: null assignee
          dueDate: null, // special case: null due date
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
          dueDate: null, // special case: null due date
          tags: [], // 0 tags
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
      ];

      const tasks = await taskData.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const existing = await taskRepository.findOne({
          where: { title: item.title, projectId: item.projectId },
          relations: { tags: true },
        });
        const task =
          existing ?? (await taskRepository.save(taskRepository.create(item)));
        acc.push(task);
        return acc;
      }, Promise.resolve<Task[]>([]));

      // Seed 10 Comments
      const commentData = [
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
      ];

      await commentData.reduce(async (prevPromise, item) => {
        await prevPromise;
        const existing = await commentRepository.findOne({
          where: {
            taskId: item.taskId,
            authorId: item.authorId,
            body: item.body,
          },
        });
        if (!existing) {
          await commentRepository.save(commentRepository.create(item));
        }
      }, Promise.resolve());
    });

    console.log("Standard seed completed successfully.");
  } finally {
    if (openedConnection && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

/**
 * Seeds a large volume of tasks (e.g. 500 tasks) for benchmark testing (Challenge X1).
 */
export async function seedLargeDataset(targetTotalTasks: number = 500): Promise<void> {
  const openedConnection = !AppDataSource.isInitialized;
  if (openedConnection) {
    await AppDataSource.initialize();
  }

  try {
    const taskRepo = AppDataSource.getRepository(Task);
    const userRepo = AppDataSource.getRepository(User);
    const projectRepo = AppDataSource.getRepository(Project);
    const tagRepo = AppDataSource.getRepository(Tag);

    const users = await userRepo.find();
    const projects = await projectRepo.find();
    const tags = await tagRepo.find();

    if (users.length === 0 || projects.length === 0) {
      throw new Error("Cannot seed large dataset without base users and projects. Run seedDatabase() first.");
    }

    const currentTaskCount = await taskRepo.count();
    const tasksToCreate = targetTotalTasks - currentTaskCount;

    if (tasksToCreate <= 0) {
      console.log(`Already have ${currentTaskCount} tasks in the database.`);
      return;
    }

    console.log(`Seeding ${tasksToCreate} additional tasks to reach ${targetTotalTasks}...`);

    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    const newTasks: Task[] = [];

    for (let i = 1; i <= tasksToCreate; i++) {
      const idx = currentTaskCount + i;
      const user = users[i % users.length];
      const project = projects[i % projects.length];
      const status = statuses[i % statuses.length];
      const priority = (i % 5) + 1;
      const daysOffset = (i % 30) - 15;

      const task = taskRepo.create({
        title: `Bulk Generated Task #${idx}`,
        description: `Automated description for high-volume benchmark testing task #${idx}.`,
        status: status,
        priority: priority,
        projectId: project.id,
        assigneeId: i % 10 === 0 ? null : user.id,
        dueDate: i % 7 === 0 ? null : dateFromToday(daysOffset),
      });

      newTasks.push(task);
    }

    // Insert in batches of 100
    const batchSize = 100;
    for (let b = 0; b < newTasks.length; b += batchSize) {
      const batch = newTasks.slice(b, b + batchSize);
      const savedTasks = await taskRepo.save(batch);

      // Attach tags to tasks
      for (const t of savedTasks) {
        const assignedTags = [tags[t.id % tags.length], tags[(t.id + 1) % tags.length]];
        await AppDataSource.createQueryBuilder()
          .relation(Task, "tags")
          .of(t)
          .add(assignedTags);
      }
    }

    console.log(`Successfully seeded dataset to ${await taskRepo.count()} total tasks.`);
  } finally {
    if (openedConnection && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

/**
 * Resets tasks back to initial standard seed state.
 */
export async function resetToStandardSeed(): Promise<void> {
  const openedConnection = !AppDataSource.isInitialized;
  if (openedConnection) {
    await AppDataSource.initialize();
  }

  try {
    await AppDataSource.query(`DELETE FROM "task_tags"`);
    await AppDataSource.query(`DELETE FROM "comments"`);
    await AppDataSource.query(`DELETE FROM "tasks"`);
    await AppDataSource.query(`DELETE FROM "project_members"`);
    await AppDataSource.query(`DELETE FROM "projects"`);
    await AppDataSource.query(`DELETE FROM "tags"`);
    await AppDataSource.query(`DELETE FROM "users"`);
    await seedDatabase();
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
