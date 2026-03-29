import dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import rolesRoute from "./routes/roles_router";
import MysqlDataSource from "./db/db.connect";
import orgranizationsRoute from "./routes/organization_routes";

const server: FastifyInstance = Fastify({});
server.register(rolesRoute);
server.register(orgranizationsRoute);

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
