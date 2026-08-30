import "reflect-metadata";
import "dotenv/config";

import { DataSource } from "typeorm";

import { User } from "./entities/User";
import { Project } from "./entities/Project";
import { ProjectMember } from "./entities/ProjectMember";
import { Task } from "./entities/Task";
import { Tag } from "./entities/Tag";
import { Comment } from "./entities/Comment";
import { queryTracker } from "./query-tracker";

export const AppDataSource = new DataSource({
  type: "postgres",

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: false,
  logging: true,
  logger: queryTracker,

  entities: [
    User,
    Project,
    ProjectMember,
    Task,
    Tag,
    Comment,
  ],

  migrations: [
    __dirname + "/migrations/*{.ts,.js}",
  ],
});
