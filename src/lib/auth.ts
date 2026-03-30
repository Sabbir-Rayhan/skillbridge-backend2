import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from './prisma'

//const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false, 
                defaultValue: "student",
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "active",
            },
        },
    },
    
    trustedOrigins: ["http://localhost:3000"], 
});