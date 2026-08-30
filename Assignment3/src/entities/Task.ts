import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Project } from "./Project";
import { User } from "./User";
import { Tag } from "./Tag";
import { Comment } from "./Comment";
import { TaskStatus } from "./enums";

@Entity({ name: "tasks" })
@Index("idx_tasks_project_id", ["projectId"])
@Index("idx_tasks_assignee_id", ["assigneeId"])
@Index("idx_tasks_status", ["status"])
@Check(
  "tasks_status_check",
  `"status" IN ('todo', 'in_progress', 'done')`,
)
@Check(
  "tasks_priority_check",
  `"priority" BETWEEN 1 AND 5`,
)
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "text",
  })
  title!: string;

  @Column({
    type: "text",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "enum",
    enum: TaskStatus,
  })
  status!: TaskStatus;

  @Column({
    type: "int",
  })
  priority!: number;

  @Column({
    name: "project_id",
    type: "int",
  })
  projectId!: number;

  @Column({
    name: "assignee_id",
    type: "int",
    nullable: true,
  })
  assigneeId!: number | null;

  @Column({
    name: "due_date",
    type: "date",
    nullable: true,
  })
  dueDate!: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @ManyToOne(
    () => Project,
    (project) => project.tasks,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "project_id",
  })
  project!: Project;

  @ManyToOne(
    () => User,
    (user) => user.assignedTasks,
    {
      nullable: true,
      onDelete: "SET NULL",
    },
  )
  @JoinColumn({
    name: "assignee_id",
  })
  assignee!: User | null;

  @ManyToMany(() => Tag, (tag) => tag.tasks, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinTable({
    name: "task_tags",
    joinColumn: {
      name: "task_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id",
    },
  })
  tags!: Tag[];

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];
}
