import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

const requestBodySchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase()),
  code: z.string(),
  password: z.string().min(6),
  option: z.number().refine((val) => val === 1 || val === 2)
});

export async function forgotValidatePassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/forgot-validate-password",
    {
      schema: {
        summary: "Forgot Validate Password",
        description: "Option 1: User Admin, Option 2: Fornecedor",
        tags: ["Forgot Password"],
        body: requestBodySchema,
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
      const { email, code, password, option } = requestBodySchema.parse(
        request.body
      );

      const dataAtual = new Date();
      const hashedPassword = await bcrypt.hash(password, 10);

      switch (option) {
        case 1:
          const user = await prisma.user.findUnique({
            where: {
              email
            },
            select: {
              id: true,
              email: true
            }
          });

          if (!user) {
            return reply.status(400).send({ message: "User not found" });
          }

          const searchCode = await prisma.forgotPassword.findFirst({
            where: {
              userId: user.id,
              token: code,
              expireAt: {
                gte: dataAtual
              }
            }
          });

          if (!searchCode) {
            return reply.status(400).send({ message: "Code is invalid" });
          }

          const updatePassword = await prisma.user.update({
            where: {
              id: user.id
            },
            data: {
              password: hashedPassword
            }
          });

          if (!updatePassword) {
            return reply.status(400).send({ message: "Password not updated" });
          }

          break;

        case 2:
          const userFornecedor = await prisma.fornecedor.findUnique({
            where: {
              email
            },
            select: {
              id: true,
              email: true
            }
          });

          if (!userFornecedor) {
            return reply.status(400).send({ message: "User not found" });
          }

          const searchCodeFornecedor = await prisma.forgotPassword.findFirst({
            where: {
              fornecedorId: userFornecedor.id,
              token: code,
              expireAt: {
                gte: dataAtual
              }
            }
          });

          if (!searchCodeFornecedor) {
            return reply.status(400).send({ message: "Code is invalid" });
          }

          const updatePasswordFornecedor = await prisma.fornecedor.update({
            where: {
              id: userFornecedor.id
            },
            data: {
              password: hashedPassword
            }
          });

          if (!updatePasswordFornecedor) {
            return reply.status(400).send({ message: "Password not updated" });
          }

          break;
      }

      return { message: "Code is valid" };
    }
  );
};