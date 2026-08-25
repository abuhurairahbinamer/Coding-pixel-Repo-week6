import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Project } from "./Project";
import { ProjectMember } from "./ProjectMember";
import { Task } from "./Task";
import { Comment } from "./Comment";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "text",
    nullable: true,
  })
  name!: string | null;

  @Column({
    type: "text",
    unique: true,
  })
  email!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects!: Project[];

  @OneToMany(
    () => ProjectMember,
    (projectMember) => projectMember.user,
  )
  projectMemberships!: ProjectMember[];

  // W2 task: User.assignedTasks as inverse @OneToMany for nullable Task.assignee
  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks!: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];
}