import { FastifyReply, FastifyRequest } from "fastify";
import MysqlDataSource from "../../app/db/db.connect";
import { User } from "./user.entity";

import {
    hashPassword,
    sanitizeUser,
    verifyPassword,
} from "../../app/shared/helpers/bcrypt_helper";

const jwt = require("jsonwebtoken");

type LoginBody = {
    email: string;
    password: string;
};

type RegisterBody = {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    isActive: boolean;
};

type UpdateUserBody = {
    email?: string;
    first_name?: string;
    last_name?: string;
    isActive?: boolean;
};

type UpdateUserParams = {
    userId: string;
};

type DeleteUserParams = {
    userId: string;
};

const userRepo = MysqlDataSource.getRepository(User);

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

export async function getAllUsers(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const roles = await userRepo.find();
        return reply.send(roles);
    } catch (error) {
        reply.status(500).send(error);
    }
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { email, password } = request.body as LoginBody;

        const errors = [];

        if (!email || email.trim().length < 3) {
            errors.push({
                field: "email",
                message: "Email must be at least 3 characters long",
            });
        }

        if (!password || password.trim().length < 8) {
            errors.push({
                field: "password",
                message: "Password must be at least 3 characters long",
            });
        }
        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        if (!process.env.JWT_SECRET_KEY) {
            request.log.error("JWT_SECRET_KEY is missing");
            return reply.code(500).send({
                msg: "Server configuration error",
            });
        }

        const userExist = await userRepo
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();

        if (userExist === null) {
            return reply.code(401).send({
                msg: "User with such email adress doesn't exist!",
            });
        }

        const isValidPassword = await verifyPassword(
            password,
            userExist.password
        );

        if (!isValidPassword) {
            return reply.code(401).send({
                msg: "Invalid email or password!",
            });
        }

        const user = sanitizeUser(userExist);

        const userToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        return reply.code(200).send({
            msg: "Login successful",
            token: userToken,
            user,
        });
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function registerUser(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { email, password, first_name, last_name, isActive } =
            request.body as RegisterBody;

        const errors = [];

        if (!email || email.trim().length < 3) {
            errors.push({
                field: "email",
                message: "Email must be at least 3 characters long",
            });
        }

        if (!password || password.trim().length < 8) {
            errors.push({
                field: "password",
                message: "Password must be at least 3 characters long",
            });
        }

        if (!first_name || first_name.trim().length < 1) {
            errors.push({
                field: "first_name",
                message: "First name must be at least 1 characters long",
            });
        }

        if (!last_name || last_name.trim().length < 1) {
            errors.push({
                field: "last_name",
                message: "Last name must be at least 1 characters long",
            });
        }

        if (typeof isActive !== "boolean") {
            errors.push({
                field: "isActive",
                message: "isActive must be from type boolean",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const hashedPassword = await hashPassword(password);

        const userExist = await userRepo
            .createQueryBuilder("user")
            .where("user.email = :email", { email })
            .getOne();

        if (userExist) {
            return reply.code(403).send({
                msg: "User with this email adress already exist!",
            });
        }

        const insertedUser = await userRepo
            .createQueryBuilder("user")
            .insert()
            .into(User)
            .values({
                email,
                password: hashedPassword,
                first_name,
                last_name,
                isActive,
            })
            .execute();

        const userId = insertedUser.identifiers[0]?.id;

        const user = await userRepo
            .createQueryBuilder("user")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (
            insertedUser.raw &&
            insertedUser.raw.affectedRows === 1 &&
            user !== null
        ) {
            const userToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1h" }
            );

            return reply.code(201).send({
                msg: "New user has been successfully registered!",
                token: userToken,
                user,
            });
        } else if (insertedUser.raw && insertedUser.raw.affectedRows === 0) {
            return reply.code(400).send({
                msg: "Something went wrong. Please try again later!",
            });
        }
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function editUser(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { userId } = request.params as UpdateUserParams;

        const { email, isActive, first_name, last_name } =
            request.body as UpdateUserBody;

        const errors = [];

        if (!email || email.trim().length < 3) {
            errors.push({
                field: "email",
                message: "Email must be at least 3 characters long",
            });
        }

        if (!first_name || first_name.trim().length < 1) {
            errors.push({
                field: "first_name",
                message: "First name must be at least 1 characters long",
            });
        }

        if (!last_name || last_name.trim().length < 1) {
            errors.push({
                field: "last_name",
                message: "Last name must be at least 1 characters long",
            });
        }

        if (typeof isActive !== "boolean") {
            errors.push({
                field: "isActive",
                message: "isActive must be from type boolean",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const userExist = await userRepo
            .createQueryBuilder("user")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (!userExist) {
            return reply.code(404).send({
                msg: `User not found!`,
            });
        }

        const updateUser = await userRepo
            .createQueryBuilder("user")
            .update(User)
            .set({ email, isActive, first_name, last_name })
            .where("id = :id", { id: userId })
            .execute();

        if (updateUser && updateUser.affected === 1) {
            const getUpdatedUser = await userRepo
                .createQueryBuilder("user")
                .where("id = :id", { id: userId })
                .getOne();

            const userToken = jwt.sign(
                {
                    userId: getUpdatedUser?.id,
                    email: getUpdatedUser?.email,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1h" }
            );

            return reply.code(200).send({
                msg: "Role has been successfully updated!",
                user: getUpdatedUser,
                token: userToken,
            });
        }
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
    try {
        const currentUser = (request as any).user;
        const { userId } = request.params as DeleteUserParams;

        if(currentUser.userId !== Number(userId)){
            return reply.code(403).send({
                msg: "User has no valid credentials to delete this profile!",

            });
        }

        const userExist = await userRepo
            .createQueryBuilder("user")
            .where("user.id = :id", { id: userId })
            .getOne();

        if (!userExist) {
            return reply.code(404).send({
                msg: `User not found!`,
            });
        }

        const deleteUser = await userRepo
            .createQueryBuilder("user")
            .delete()
            .from(User)
            .where("user.id = :id", { id: userId })
            .execute();

        if (deleteUser && deleteUser.affected === 1) {
            return reply.code(200).send({
                msg: "User has been successfully deleted!",
            });
        }
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}