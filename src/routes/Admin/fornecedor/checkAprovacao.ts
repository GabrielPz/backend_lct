import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../../../lib/prisma";
import { autenticarToken } from "../user/login";
import { z } from "zod";

const requestBodySchema = z.object({
  code: z.string()
});

export async function checkCodeLogin(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fornecedor/:id/check-code",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get Fornecedor",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        params: z.object({
          id: z.string().uuid()
        }),
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
      const { id } = z
        .object({
          id: z.string().uuid()
        })
        .parse(request.params);

      const { code } = requestBodySchema.parse(request.body);

      const fornecedor = await prisma.fornecedor.findUnique({
        where: {
          id: id
        },
        include: {
          areaAtuacao: true
        }
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      const validateCode = await prisma.aprovacaoLoginFornecedor.findUnique({
        where: {
          fornecedorId: id
        },
        select: {
          token: true,
          expireAt: true
        }
      });

      if (!validateCode) {
        return reply.status(400).send({ message: "Check fornecedor" });
      }

      if (validateCode.token !== code) {
        return reply.status(400).send({ message: "Invalid code" });
      }

      if (validateCode.expireAt < new Date()) {
        return reply.status(400).send({ message: "Code expired" });
      }

      return reply.send({ message: "Check fornecedor" });
    }
  );
}
