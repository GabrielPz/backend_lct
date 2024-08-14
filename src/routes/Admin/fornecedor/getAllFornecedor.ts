import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import moment from "moment-timezone";
import { autenticarToken } from "../user/login";

const requestQuerySchema = z.object({
  nome: z.string().optional(),
  cnpj: z.string().optional()
});

export async function getAllFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/fornecedor",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Fornecedor",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        query: requestQuerySchema,
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              nome: z.string(),
              email: z.string().email(),
              cnpj: z.string().length(14),
              telefone: z.string().length(11),
              logradouro: z.string(),
              numero: z.string(),
              bairro: z.string(),
              cidade: z.string(),
              estado: z.string().length(2),
              banco: z.string(),
              agencia: z.string(),
              conta: z.string(),
              tipoDeConta: z.string(),
              createdAt: z.string(),
              areaAtuacao: z.array(
                z.object({
                  id: z.string().uuid(),
                  nome: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string()
                })
              )
            })
          ),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { nome, cnpj } = requestQuerySchema.parse(request.query);

      const fornecedores = await prisma.fornecedor.findMany({
        where: {
          AND: [
            nome ? { nome: { contains: nome, mode: 'insensitive' } } : {},
            cnpj ? { cnpj: { contains: cnpj } } : {}
          ]
        },
        select: {
          id: true,
          nome: true,
          email: true,
          cnpj: true,
          telefone: true,
          logradouro: true,
          numero: true,
          bairro: true,
          cidade: true,
          estado: true,
          banco: true,
          agencia: true,
          conta: true,
          tipoDeConta: true,
          areaAtuacao: {
            select: {
              id: true,
              nome: true,
              createdAt: true,
              updatedAt: true
            }
          },
          createdAt: true
        }
      });

      if (!fornecedores) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      const transformedFornecedores = fornecedores.map((item) => ({
        id: item.id,
        nome: item.nome,
        email: item.email,
        cnpj: item.cnpj,
        telefone: item.telefone,
        logradouro: item.logradouro,
        numero: item.numero,
        bairro: item.bairro,
        cidade: item.cidade,
        estado: item.estado,
        banco: item.banco,
        agencia: item.agencia,
        conta: item.conta,
        tipoDeConta: item.tipoDeConta,
        createdAt: moment
          .tz(item.createdAt, "America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss"),
        areaAtuacao: item.areaAtuacao.map((area) => ({
          id: area.id,
          nome: area.nome,
          createdAt: moment
            .tz(area.createdAt, "America/Sao_Paulo")
            .format("DD/MM/YYYY HH:mm:ss"),
          updatedAt: moment
            .tz(area.updatedAt, "America/Sao_Paulo")
            .format("DD/MM/YYYY HH:mm:ss")
        }))
      }));

      return reply.send(transformedFornecedores);
    }
  );
}