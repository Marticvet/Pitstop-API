import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

type User = {
    id: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    isActive: boolean;
};

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export function sanitizeUser(user: User) {
    const { password, ...rest } = user;
    return rest;
}