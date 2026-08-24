import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { User } from "./User";
import { Project } from "./Project";
import { ProjectRole } from "./enums";

@Entity({ name: "project_members" })
export class ProjectMember {
  @PrimaryColumn({
    name: "user_id",
    type: "int",
  })
  userId!: number;

  @PrimaryColumn({
    name: "project_id",
    type: "int",
  })
  projectId!: number;

  @Column({
    type: "enum",
    enum: ProjectRole,
    enumName: "project_members_role_enum",
  })
  role!: ProjectRole;

  @ManyToOne(
    () => User,
    (user) => user.projectMemberships,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "user_id",
  })
  user!: User;

  @ManyToOne(
    () => Project,
    (project) => project.members,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({
    name: "project_id",
  })
  project!: Project;
}