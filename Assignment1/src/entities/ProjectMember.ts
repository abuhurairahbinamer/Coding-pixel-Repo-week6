import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { User } from "./User";
import { Project } from "./Project";
import { ProjectRole } from "./enums";

// @Entity({ name: "project_members" })
@Entity({ name: "project_members" })
@Check(
  "project_members_role_check",
  `"role" IN ('owner', 'admin', 'member', 'viewer')`,
)
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

  // @Column({
  //   type: "enum",
  //   enum: ProjectRole,
  //   enumName: "project_members_role_enum",
  // })
  // role!: ProjectRole;
  @Column({
  type: "text",
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