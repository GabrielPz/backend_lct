import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { autenticarToken } from "./login";

interface UserResponse {
  id?: string;
  nome?: string;
  email?: string;
  password?: string;
}

const paramsSchema = z.object({
  id: z.string().uuid()
});

const bodySchema = z.object({
  nome: z.string().optional(),
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase())
    .optional(),
  password: z.string().min(6).optional(),
  passwordOld: z.string().min(6).optional()
});

export async function editUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/user/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit User",
        tags: ["User"],
        headers: z.object({
          authorization: z.string()
        }),
        params: paramsSchema,
        body: bodySchema,
        response: {
          200: z.object({
            message: z.string()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { id } = paramsSchema.parse(request.params);
      const { email, nome, password, passwordOld } = bodySchema.parse(
        request.body
      );

      const updateUser: UserResponse = {};

      if (email) {
        const searchEmailExisting = await prisma.user.findUnique({
          where: {
            email
          }
        });

        if (searchEmailExisting) {
          return reply.status(400).send({ message: "Email already exists" });
        }

        updateUser.email = email;
      }
      if (nome) {
        updateUser.nome = nome;
      }
      if (password && passwordOld) {
        const user = await prisma.user.findUnique({
          where: {
            id: id
          },
          select: {
            password: true
          }
        });

        if (!user) {
          return reply.status(400).send({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(passwordOld, user.password);

        if (!validPassword) {
          return reply.status(400).send({ message: "Invalid password" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        updateUser.password = hashedPassword;
      }

      const user = await prisma.user.update({
        where: {
          id: id
        },
        data: updateUser,
        select: {
          id: true,
          nome: true,
          email: true
        }
      });

      if (!user) {
        return reply.status(400).send({ message: "User not updated" });
      }

      return reply.send({ message: "User updated" });
    }
  );
}
