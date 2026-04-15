import dotenv from "dotenv";
dotenv.config();

import { DataSource } from "typeorm";
import { Role } from "../../modules/roles/role.entity";
import { Organization } from "../../modules/organizations/organization.entity";
import { User } from "../../modules/users/user.entity";
import { Membership } from "../../modules/memberships/membership.entity";

const MysqlDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [Role, Organization, User, Membership],
    synchronize: true,
    logging: false,
});

export default MysqlDataSource;