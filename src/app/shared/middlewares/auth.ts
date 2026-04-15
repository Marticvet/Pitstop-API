import { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv";
const jwt = require("jsonwebtoken");

dotenv.config();

export async function auth(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.code(401).send({
            error: "Authorization header has not been provided",
        });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return reply.code(401).send({
            error: "Authorization header must be in format: Bearer <token>",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

        // optional: attach decoded token data to request
        (request as any).user = decoded;
    } catch (error) {
        return reply.code(401).send({
            error: "Invalid or expired token",
        });
    }
}