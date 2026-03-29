import dotenv from "dotenv";
dotenv.config();

import { Roles } from "../entities/Roles";
import { DataSource } from "typeorm";
import { Organization } from "../entities/Organization";

const MysqlDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [Roles, Organization],
    synchronize: true,
    logging: true,
});

export default MysqlDataSource;