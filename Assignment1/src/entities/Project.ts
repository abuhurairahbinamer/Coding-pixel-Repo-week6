import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User";
import { ProjectMember } from "./ProjectMember";
import { Task } from "./Task";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "text",
  })
  name!: string;

  @Column({
    name: "owner_id",
    type: "int",
  })
  ownerId!: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.ownedProjects, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "owner_id",
  })
  owner!: User;

  @OneToMany(
    () => ProjectMember,
    (projectMember) => projectMember.project,
  )
  members!: ProjectMember[];

  // W2 task: Project.tasks as @OneToMany to Task
  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}