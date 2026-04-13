import MysqlDataSource from "../db/db.connect";
import { Role } from "../entities/Role";

import {
    FastifyReply,
    FastifyRequest,
} from "fastify";

type RoleBody = {
    role: string;
};

type RoleParams = {
    roleId: number;
};

const roleRepo = MysqlDataSource.getRepository(Role);

export async function getAllRoles(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const roles = await roleRepo.find();

        return reply.send(roles);
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function getRoleById(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { roleId } = request.params as RoleParams;

        const roleExist = await roleRepo
            .createQueryBuilder()
            .where("roles.id = :id", { id: roleId })
            .getOne();

        if (roleExist === null) {
            return reply.code(404).send({
                msg: `Role not found!`,
            });
        }

        return reply.code(200).send(roleExist);
    } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function createRole(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { role } = request.body as RoleBody;

        const errors = [];

        if (!role || role.trim().length < 3) {
            errors.push({
                field: "role",
                message: "Role must be at least 3 characters long",
            });
        }
        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const insertedRole = await roleRepo
            .createQueryBuilder()
            .insert()
            .into(Role)
            .values({ role })
            .execute();

        const roleId = insertedRole.identifiers[0]?.id;

        const createdRole = await roleRepo
            .createQueryBuilder()
            .where("roles.id = :id", { id: roleId })
            .getOne();

        if (insertedRole.raw && insertedRole.raw.affectedRows === 1) {
            return reply.send({
                msg: "New role has been successfully created!",
                data: createdRole,
            });
        } else if (insertedRole.raw && insertedRole.raw.affectedRows === 0) {
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

export async function updateRole(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { roleId } = request.params as RoleParams;
        const { role } = request.body as RoleBody;

        const errors = [];

        if (!role || role.trim().length < 3) {
            errors.push({
                field: "role",
                message: "Role must be at least 3 characters long",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const roleExist = await roleRepo
            .createQueryBuilder()
            .where("roles.id = :id", { id: roleId })
            .getOne();

        if (roleExist === null) {
            return reply.code(404).send({
                msg: `Role not found!`,
            });
        }

        const updateRole = await roleRepo
            .createQueryBuilder()
            .update(Role)
            .set({ role: role })
            .where("roles.id = :id", { id: roleId })
            .execute();

        const updatedRole = await roleRepo
            .createQueryBuilder()
            .where("roles.id = :id", {
                id: roleId,
            })
            .getOne();

        if (updateRole.affected === 1) {
            return reply.code(200).send({
                msg: "Role has been successfully updated!",
                data: updatedRole,
            });
        } else if (updateRole.affected === 0) {
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

export async function deleteRole(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { roleId } = request.params as RoleParams;

        const roleExist = await roleRepo
            .createQueryBuilder()
            .where("roles.id = :id", { id: roleId })
            .getOne();

        if (roleExist === null) {
            return reply.code(400).send({
                msg: `Role not found!`,
            });
        }

        const deletedRole = await roleRepo
            .createQueryBuilder()
            .delete()
            .where("id = :id", { id: roleId })
            .execute();

        if (deletedRole.affected === 1) {
            return reply.code(200).send({
                msg: `Role with id ${roleId} has been deleted!`,
            });
        } else if (deletedRole.affected === 0) {
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
