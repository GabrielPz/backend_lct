import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import moment from "moment-timezone";
import { autenticarToken } from "../user/login";

const requestQuerySchema = z.object({
  estado: z.string().optional()
});

export async function getAllPropostas(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/proposta",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Get All Proposta",
        headers: z.object({
          authorization: z.string()
        }),
        tags: ["Proposta"],
        query: requestQuerySchema,
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              idContratacaoPNCP: z.string(),
              modalidadeDaContratacao: z.string(),
              ultimaAtualizacao: z.string(),
              orgao: z.string(),
              local: z.string(),
              objeto: z.string(),
              pncpId: z.string(),
              fornecedor: z.object({
                id: z.string(),
                nome: z.string(),
                cnpj: z.string(),
                email: z.string(),
                telefone: z.string()
              }),
              notificationPropostaFornecedor: z.number(),
              progresso: z.array(
                z.object({
                  id: z.number(),
                  descricao: z.string(),
                  propostaId: z.string(),
                  createdAt: z.string()
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
      const { estado } = requestQuerySchema.parse(request.query);

      const propostas = await prisma.proposta.findMany({
        where: {
          estado: estado ? estado : undefined
        },
        select: {
          id: true,
          title: true,
          idContratacaoPNCP: true,
          modalidadeDaContratacao: true,
          ultimaAtualizacao: true,
          orgao: true,
          local: true,
          objeto: true,
          pncpId: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              email: true,
              telefone: true
            }
          },
          fornecedorItemProposta: {
            select: {
              id: true,
            },
            where: {
              isRead: false
            }
          },
          Progresso: {
            select: {
              id: true,
              descricao: true,
              propostaId: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (!propostas) {
        return reply.status(400).send({ message: "Erro ao buscar propostas" });
      }

      const transformedPropostas = propostas.map((item) => ({
        id: item.id,
        title: item.title,
        idContratacaoPNCP: item.idContratacaoPNCP,
        modalidadeDaContratacao: item.modalidadeDaContratacao,
        ultimaAtualizacao: moment
          .tz(item.ultimaAtualizacao, "America/Sao_Paulo")
          .format("DD/MM/YYYY HH:mm:ss"),
        orgao: item.orgao,
        local: item.local,
        objeto: item.objeto,
        pncpId: item.pncpId,
        fornecedor: item.fornecedor,
        notificationPropostaFornecedor: item.fornecedorItemProposta.length,
        progresso: item.Progresso.map((progresso) => ({
          id: progresso.id,
          descricao: progresso.descricao,
          propostaId: progresso.propostaId,
          createdAt: moment
            .tz(progresso.createdAt, "America/Sao_Paulo")
            .format("DD/MM/YYYY HH:mm:ss")
        }))
      }));

      return reply.status(200).send(transformedPropostas);
    }
  );
};
