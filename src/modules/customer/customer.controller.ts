import { FastifyReply, FastifyRequest } from "fastify";
import MysqlDataSource from "../../app/db/db.connect";
import { Customer } from "../customer/customer.entity";
import { Organization } from "../organizations/organization.entity";
import { Like } from "typeorm";

const customerRepo = MysqlDataSource.getRepository(Customer);
const organizationRepo = MysqlDataSource.getRepository(Organization);

type GetCustomerByOrganizationIdParams = {
    organizationId: string;
    customerId: string;
};

type CreateCustomerParams = {
    organizationId: string;
};

type DeleteCustomerParams = {
    customerId: string;
};

type GetCustomerOrganizationsParams = {
    organizationId: string;
};

type EditCustomerParams = {
    customerId: string;
};

type CreateCustomerBody = {
    organizationId: number;
    full_name: string;
    phone: string;
    email?: string | null;
    notes?: string | null;
    tags?: string[];
};

type EditCustomerBody = {
    full_name: string;
    phone: string;
    email?: string | null;
    notes?: string | null;
    tags?: string[];
};

type GetCustomersQuery = {
    page?: string;
    pageSize?: string;
    search?: string;
    email?: string;
    phone?: string;
    full_name?: string;
    tags?: string;
    sortBy?: "createdAt" | "updatedAt" | "full_name" | "email";
    sortOrder?: "ASC" | "DESC";
};

export async function getCustomerByOrganizationId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { customerId, organizationId } =
            request.params as GetCustomerByOrganizationIdParams;
        const orgId = Number(organizationId);
        const custOrg = Number(customerId);

        if (Number.isNaN(orgId)) {
            return reply.code(400).send({ msg: "Invalid organization id" });
        }

        if (Number.isNaN(custOrg)) {
            return reply.code(400).send({ msg: "Invalid customer id" });
        }

        const customers = await customerRepo
            .createQueryBuilder("customer")
            .where("customer.organizationId = :organizationId", {
                organizationId,
            })
            .andWhere("customer.id = :id", { id: customerId })
            .getMany();

        return reply.code(200).send(customers);
    } catch (error) {
        request.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function createCustomer(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } = request.params as CreateCustomerParams;
        const { full_name, phone, email, notes, tags } =
            request.body as CreateCustomerBody;

        const errors = [];

        if (!full_name || full_name.trim().length < 1) {
            errors.push({
                field: "full_name",
                message: "Full name cannot be empty",
            });
        }

        if (!phone || phone.trim().length < 1) {
            errors.push({
                field: "phone",
                message: "Phone cannot be empty",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const orgId = Number(organizationId);

        if (Number.isNaN(orgId)) {
            return reply.code(400).send({
                msg: "Invalid organization id",
            });
        }

        const organizationExist = await organizationRepo
            .createQueryBuilder("organization")
            .where("organization.id = :id", { id: orgId })
            .getOne();

        if (!organizationExist) {
            return reply.code(404).send({
                msg: "Organization not found",
            });
        }

        const createData: Partial<Customer> = {};

        if (full_name) createData.full_name = full_name;
        if (phone) createData.phone = phone;
        if (email) createData.email = email;
        if (notes) createData.notes = notes;
        if (tags) createData.tags = tags;

        const createdCustomer = await customerRepo
            .createQueryBuilder()
            .insert()
            .into(Customer)
            .values({
                ...createData,
                organizationId: orgId,
            })
            .execute();

        if (!createdCustomer.identifiers[0]?.id) {
            return reply.code(400).send({
                msg: "Unable to create customer",
            });
        }

        return reply.code(201).send({
            msg: "Customer created successfully",
            data: {
                id: createdCustomer.identifiers[0].id,
                ...createData,
                organizationId,
            },
        });
    } catch (error) {
        request.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function getAllOrganizationsByCustomerId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { organizationId } =
            request.params as GetCustomerOrganizationsParams;
        const orgId = Number(organizationId);

        if (Number.isNaN(orgId)) {
            return reply.code(400).send({
                msg: "Invalid customer id",
            });
        }

        const organizationExist = await organizationRepo
            .createQueryBuilder("organization")
            .where("organization.id = :id", {
                id: orgId,
            })
            .getOne();

        if (!organizationExist) {
            return reply.code(404).send({
                msg: "Organization not found",
            });
        }

        const getAllCustomers = await customerRepo
            .createQueryBuilder()
            .where("customer.organizationId = :organizationId", {
                organizationId: 2,
            })
            .getMany();

        return reply.code(200).send(getAllCustomers);
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function editCustomerByOrganizationId(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { customerId } = request.params as EditCustomerParams;
        const { full_name, phone, notes, tags, email } =
            request.body as EditCustomerBody;

        const errors = [];

        if (!full_name || full_name.trim().length < 1) {
            errors.push({
                field: "full_name",
                message: "Full name cannot be empty",
            });
        }

        if (!phone || phone.trim().length < 1) {
            errors.push({
                field: "phone",
                message: "Phone cannot be empty",
            });
        }

        if (errors.length > 0) {
            return reply.code(400).send({
                error: "Validation Error",
                details: errors,
            });
        }

        const custmId = Number(customerId);

        if (Number.isNaN(custmId)) {
            return reply.code(400).send({
                msg: "Invalid customer id",
            });
        }

        const customerExist = await customerRepo
            .createQueryBuilder("customer")
            .where("customer.id = :id", { id: custmId })
            .getOne();

        if (!customerExist) {
            return reply.code(404).send({
                msg: "Customer not found",
            });
        }

        const updateData: Partial<Customer> = {};

        if (full_name) updateData.full_name = full_name;
        if (phone) updateData.phone = phone;
        if (email) updateData.email = email;
        if (notes) updateData.notes = notes;
        if (tags) updateData.tags = tags;

        const editedCustomer = await customerRepo
            .createQueryBuilder("customer")
            .update(Customer)
            .set(updateData)
            .where("customer.id = :id", { id: custmId })
            .execute();

        if (editedCustomer.affected === 0) {
            return reply.code(404).send({
                msg: "Unable to edit customer",
            });
        }

        return reply.code(200).send({
            msg: "Customer edited successfully",
            data: {
                id: customerId,
                ...updateData,
            },
        });
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function deleteCustomer(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const { customerId } = request.params as DeleteCustomerParams;

        const custmId = Number(customerId);

        if (Number.isNaN(custmId)) {
            return reply.code(400).send({
                msg: "Invalid customer id",
            });
        }

        const customerExist = await customerRepo
            .createQueryBuilder("customer")
            .where("customer.id = :id", { id: custmId })
            .getOne();

        if (!customerExist) {
            return reply.code(404).send({
                msg: "Customer not found",
            });
        }

        const result = await customerRepo
            .createQueryBuilder()
            .delete()
            .from(Customer)
            .where("customer.id = :id", { id: custmId })
            .execute();

        if (result.affected === 0) {
            return reply.code(404).send({
                msg: "Customer not found",
            });
        }

        return reply.code(200).send({
            msg: "Customer deleted successfully",
        });
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}

export async function getCustomers(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const {
            page,
            pageSize,
            search,
            email,
            phone,
            full_name,
            tags,
            sortBy,
            sortOrder,
        } = request.query as GetCustomersQuery;

        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);

        if (
            Number.isNaN(pageNumber) ||
            pageNumber < 1 ||
            Number.isNaN(pageSizeNumber) ||
            pageSizeNumber < 1 ||
            pageSizeNumber > 100
        ) {
            return reply.code(400).send({
                msg: "Invalid pagination values",
            });
        }

        const allowedSortFields = [
            "full_name",
            "createdAt",
            "updateAt",
            "email",
        ];
        let safeSortBy;

        if (sortBy) {
            safeSortBy = allowedSortFields.includes(sortBy)
                ? sortBy
                : "createdAt";
        }
        const safeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

        const query = await customerRepo.createQueryBuilder("customer");

        if (search) {
            query.andWhere(
                `(
                    customer.full_name LIKE :search
                    OR customer.email LIKE :search
                    OR customer.phone LIKE :search
                )`,
                { search: `%${search}%` }
            );
        }

        if (email) {
            query.andWhere("customer.email LIKE :email", {
                email: `%${email}%`,
            });
        }

        if (phone) {
            query.andWhere("customer.phone LIKE :phone", {
                phone: `%${phone}%`,
            });
        }

        if (full_name) {
            query.andWhere("customer.full_name LIKE :full_name", {
                full_name: `%${full_name}%`,
            });
        }

        if (tags) {
            query.andWhere("customer.tags LIKE :tags", {
                tags: `%${tags}%`,
            });
        }

        if (sortBy) {
            query.orderBy(sortBy, safeSortOrder);
        }

        query.skip((pageNumber - 1) * pageSizeNumber).take(pageSizeNumber);

        const [customers, total] = await query.getManyAndCount();

        return reply.code(200).send({
            data: customers,
            meta: {
                page: pageNumber,
                pageSize: pageSizeNumber,
                total,
                totalPages: Math.ceil(total / pageSizeNumber),
            },
        });
    } catch (error) {
        reply.log.error(error);
        console.error(error);

        return reply.code(500).send({
            msg: "Something went wrong. Please try again later.",
        });
    }
}
