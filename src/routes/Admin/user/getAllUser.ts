import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "./login";
import moment from "moment-timezone";

export async function getAllUser(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All User",
        tags: ["User"],
        headers: z.object({
          authorization: z.string()
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              nome: z.string(),
              email: z.string().email(),
              profilePhoto: z.string().optional().nullish(),
              createdAt: z.string()
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          profilePhoto: true,
          createdAt: true
        }
      });

      if (!users) {
        throw new Error("Users not found");
      }

      if(users.length > 0) {
        const formattedUser = users.map((user) => {
          return {
            ...user,
            createdAt: moment
              .tz(user.createdAt, "America/Sao_Paulo")
              .format("DD/MM/YYYY HH:mm:ss")
          };
        });

        return reply.send(formattedUser);
      }

      return reply.status(400).send({ message: "Users not found" });
    }
  );
}