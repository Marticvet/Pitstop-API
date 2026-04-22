import dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import MysqlDataSource from "./db/db.connect";

import userRouter from "../modules/users/user.routes";
import roleRouter from "../modules/roles/role.routes";
import organizationRouter from "../modules/organizations/organization.routes";
import membershipRouter from "../modules/memberships/membership.routes";
import customerRouter from "../modules/customer/customer.routes";

const server: FastifyInstance = Fastify({});

server.register(roleRouter, {prefix: "/roles"});
server.register(organizationRouter, {prefix: "/orgranizations"});
server.register(userRouter, {prefix: "/users"});
server.register(customerRouter, {prefix: "/customers"});
server.register(membershipRouter);

const start = async () => {
    try {
        await MysqlDataSource.initialize();
        console.log("Data Source has been initialized!");

        await server.listen({ port: Number(process.env.API_PORT) });
        console.log(`Server running on port: ${Number(process.env.API_PORT)!}`);

    } catch (err) {
        console.error("Error during Data Source initialization", err);
        server.log.error(err);

        process.exit(1);
    }
};

start();
