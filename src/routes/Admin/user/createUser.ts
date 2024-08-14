import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { autenticarToken } from "./login";
import { z } from "zod";

const requestBodySchema = z.object({
  nome: z.string(),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
  password: z.string().min(6),
});

export async function createUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/user",
    {
      schema: {
        summary: "Create User",
        tags: ["User"],
        headers: z.object({
          authorization: z.string(),
        }),
        body: requestBodySchema,
        response: {
          200: z.object({
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, nome, password } = requestBodySchema.parse(request.body);

      const existingEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingEmail) {
        return reply.status(400).send({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          nome,
          password: hashedPassword,
        },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });

      if (!user) {
        throw new Error("User not created");
      }

      return user;
    }
  );
}
