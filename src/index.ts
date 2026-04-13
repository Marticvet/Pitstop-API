import dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import MysqlDataSource from "./db/db.connect";

import userRouter from "./routes/user.routes";
import roleRouter from "./routes/role.routes";
import organizationRouter from "./routes/organization.routes";

const server: FastifyInstance = Fastify({});

server.register(roleRouter, {prefix: "/roles"});
server.register(organizationRouter, {prefix: "/orgranizations"});
server.register(userRouter, {prefix: "/users"});

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
