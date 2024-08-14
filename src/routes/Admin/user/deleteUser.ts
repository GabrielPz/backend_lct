import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "./login";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function deleteUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/user/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete User",
        tags: ["User"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
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
      const { id } = requestParamsSchema.parse(request.params);

      const user = await prisma.user.delete({
        where: {
          id: id
        },
        select: {
          id: true,
          nome: true,
          email: true
        }
      });

      if (!user) {
        throw new Error("User not deleted");
      }

      return reply.send({ message: "User deleted" });
    }
  );
}