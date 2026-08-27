import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Task } from "./Task";
import { User } from "./User";

@Entity({ name: "comments" })
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: "task_id",
    type: "int",
  })
  taskId!: number;

  @Column({
    name: "author_id",
    type: "int",
  })
  authorId!: number;

  @Column({
    type: "text",
  })
  body!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @ManyToOne(
    () => Task,
    (task) => task.comments,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "task_id",
  })
  task!: Task;

  @ManyToOne(
    () => User,
    (user) => user.comments,
    {
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({
    name: "author_id",
  })
  author!: User;
}