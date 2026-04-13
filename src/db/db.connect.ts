import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import { Role } from "../entities/Role";
import { Organization } from "../entities/Organization";
import { User } from "../entities/User";

const MysqlDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [Role, Organization, User],
    synchronize: true,
    logging: false,
});

export default MysqlDataSource;