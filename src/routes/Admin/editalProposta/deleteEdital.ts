import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function deleteEditalProposta(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    "/editalProposta/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Delete Edital",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["EditalProposta"],
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
      const deleteEdital = await prisma.editalProposta.delete({
        where: {
          id
        }
      });

      if (!deleteEdital) {
        return reply.status(400).send({ message: "Error on delete Edital" });
      }

      reply.send({ message: "Edital deleted successfully" });
    }
  );
}
