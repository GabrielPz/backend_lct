import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import { autenticarToken } from "../user/login";

interface FornecedorUpdateData {
  nome?: string;
  email?: string;
  password?: string;
  cnpj?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoDeConta?: string;
}

const requestBodySchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  cnpj: z.string().length(14).optional(),
  telefone: z.string().length(11).optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipoDeConta: z.string().optional(),
  areaAtuacao: z.array(z.string()).optional()
});

const requestParamsSchema = z.object({
  id: z.string().uuid()
});

export async function editFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/fornecedor/:id",
    {
      schema: {
        preHandler: autenticarToken,
        summary: "Edit Fornecedor",
        tags: ["Fornecedor"],
        headers: z.object({
          authorization: z.string()
        }),
        params: requestParamsSchema,
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
      const { id } = requestParamsSchema.parse(request.params);

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

      const updateData: FornecedorUpdateData = {};

      if (nome && nome != null) {
        updateData.nome = nome;
      }
      if (email && email != null) {
        const searchEmailExisting = await prisma.fornecedor.findUnique({
          where: {
            email
          }
        });

        if (searchEmailExisting) {
          return reply.status(400).send({ message: "Email already exists" });
        }

        updateData.email = email;
      }
      if (password && password != null) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
      if (cnpj && cnpj != null) {
        const searchCnpjExisting = await prisma.fornecedor.findUnique({
          where: {
            cnpj
          }
        });

        if (searchCnpjExisting) {
          return reply.status(400).send({ message: "CNPJ already exists" });
        }
        
        updateData.cnpj = cnpj;
      }
      if (telefone && telefone != null) {
        updateData.telefone = telefone;
      }
      if (logradouro && logradouro != null) {
        updateData.logradouro = logradouro;
      }
      if (numero && numero != null) {
        updateData.numero = numero;
      }
      if (bairro && bairro != null) {
        updateData.bairro = bairro;
      }
      if (cidade && cidade != null) {
        updateData.cidade = cidade;
      }
      if (estado && estado != null) {
        updateData.estado = estado;
      }
      if (banco && banco != null) {
        updateData.banco = banco;
      }
      if (agencia && agencia != null) {
        updateData.agencia = agencia;
      }
      if (conta && conta != null) {
        updateData.conta = conta;
      }
      if (tipoDeConta && tipoDeConta != null) {
        updateData.tipoDeConta = tipoDeConta;
      }

      const fornecedor = await prisma.fornecedor.update({
        where: {
          id: id
        },
        data: updateData
      });

      if (!fornecedor) {
        return reply.status(400).send({ message: "Fornecedor not found" });
      }

      if (areaAtuacao) {
        await prisma.areaAtuacao.deleteMany({
          where: {
            fornecedorId: id
          }
        });

        await prisma.areaAtuacao.createMany({
          data: areaAtuacao.map((nome) => ({
            nome: nome,
            fornecedorId: id
          }))
        });
      }

      return reply.send({ message: "Fornecedor updated" });
    }
  );
}