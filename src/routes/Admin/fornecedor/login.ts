import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../../lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { transporter } from "../../../services/nodeMailer";
import { generateNumericCode } from "../../../utils/generateCode";

export const enviarEmail = ({
  email,
  code,
  name
}: {
  email: string;
  code: string;
  name: string;
}) => {
  transporter.sendMail(
    {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Código de login",
      text: `Olá ${name} sua chave de acesso é: ${code}, validade de 3 horas.`
    },
    (error: Error, info: any) => {
      if (error) {
        // console.error(error);
      } else {
        // console.log("Chave secreta 2FA enviada com sucesso: " + info.response);
      }
    }
  );
  console.log(`Chave secreta 2FA enviada para ${email}: ${code}`);
};

export async function loginFornecedor(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/fornecedor/login",
    {
      schema: {
        summary: "Login Fornecedor",
        tags: ["Fornecedor"],
        body: z.object({
          email: z.string().email().transform((v) => v.toLowerCase()),
          password: z.string().min(6)
        }),
        response: {
          200: z.object({
            token: z.string(),
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email()
          }),
          400: z.object({
            message: z.string()
          })
        }
      }
    },
    async (request, reply) => {
      const { email, password } = z
        .object({
          email: z.string().email(),
          password: z.string().min(6)
        })
        .parse(request.body);

      const fornecedor = await prisma.fornecedor.findUnique({
        where: {
          email
        },
        select: {
          id: true,
          nome: true,
          email: true,
          password: true
        }
      });

      if (!fornecedor) {
        reply.status(400);
        return { message: "Fornecedor not found" };
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        fornecedor.password
      );

      if (!isPasswordCorrect) {
        reply.status(400);
        return { message: "Invalid password" };
      }

      const chaveSecreta = process.env.SECRET_KEY_JWT;
      if (!chaveSecreta) {
        throw new Error("Secret key not found");
      }
      const token = jwt.sign({ id: fornecedor.id, chaveSecreta }, chaveSecreta, {});

      const code = generateNumericCode();

      const dataAtual = new Date();
      dataAtual.setHours(dataAtual.getHours() + 3);

      await prisma.aprovacaoLoginFornecedor.upsert({
        where: {
          fornecedorId: fornecedor.id
        },
        update: {
          token: code,
          expireAt: dataAtual
        },
        create: {
          token: code,
          fornecedorId: fornecedor.id,
          expireAt: dataAtual
        }
      });

      enviarEmail({
        email: fornecedor.email,
        code: code,
        name: fornecedor.nome
      });

      return reply.status(200).send({
        token: token,
        id: fornecedor.id,
        nome: fornecedor.nome,
        email: fornecedor.email
        });
    }
  );
}