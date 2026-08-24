import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Task } from "./Task";

@Entity({ name: "tags" })
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "text",
    unique: true,
  })
  name!: string;

  @ManyToMany(() => Task, (task) => task.tags, {
  onDelete: "CASCADE",
  onUpdate: "NO ACTION",
})
tasks!: Task[];
}