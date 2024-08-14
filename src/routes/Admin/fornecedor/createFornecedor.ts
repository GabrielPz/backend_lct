import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";

const requestBodySchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  password: z.string(),
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
  areaAtuacao: z.array(z.string())
});

export async function createFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fornecedor",
    {
      schema: {
        summary: "Create Fornecedor",
        tags: ["Fornecedor"],
        body: requestBodySchema,
        response: {
          200: z.object({
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email()
          }),
          400: z.object({
            message: z.string()
          })
        },
      }
    },
    async (request, reply) => {
      const {
        nome,
        email,
        password,
        cnpj,
        telefone,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        banco,
        agencia,
        conta,
        tipoDeConta,
        areaAtuacao
      } = requestBodySchema.parse(request.body);

      const searchCNPJ = await prisma.fornecedor.findUnique({
        where: {
          cnpj
        }
      });

      if (searchCNPJ) {
        return reply.status(400).send({ message: "CNPJ already exists" });
      }

      const searchEmail = await prisma.fornecedor.findUnique({
        where: {
          email
        }
      });

      if (searchEmail) {
        return reply.status(400).send({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const fornecedor = await prisma.fornecedor.create({
        data: {
          nome,
          email,
          password: hashedPassword,
          cnpj,
          telefone,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          banco,
          agencia,
          conta,
          tipoDeConta
        },
        select: {
          id: true,
          nome: true,
          email: true
        }
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "User not created" });
      }

      const area = await prisma.areaAtuacao.createMany({
        data: areaAtuacao.map((nome) => ({
          nome: nome,
          fornecedorId: fornecedor.id
        }))
      });

      if (!area) {
        return reply.status(400).send({ message: "Area not created" });
      }

      return fornecedor;
    }
  );
}
