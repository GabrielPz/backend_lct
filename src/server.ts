import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform
} from "fastify-type-provider-zod";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyCors from "@fastify/cors";
import { errorHandler } from "./error-handler";
import { login } from "./routes/Admin/user/login";
import { createUser } from "./routes/Admin/user/createUser";
import { editUser } from "./routes/Admin/user/editUser";
import { deleteUser } from "./routes/Admin/user/deleteUser";
import { getAllUser } from "./routes/Admin/user/getAllUser";
import { createFornecedor } from "./routes/Admin/fornecedor/createFornecedor";
import { getAllFornecedor } from "./routes/Admin/fornecedor/getAllFornecedor";
import { getFornecedor } from "./routes/Admin/fornecedor/getFornecedor";
import { deleteFornecedor } from "./routes/Admin/fornecedor/deleteFornecedor";
import { editFornecedor } from "./routes/Admin/fornecedor/editFornecedor";
import { createProposta } from "./routes/Admin/proposta/createProposta";
import { createProgressoProposta } from "./routes/Admin/progressoProposta/createProgresso";
import { deleteProgressoProposta } from "./routes/Admin/progressoProposta/deleteProgresso";
import { editProgressoProposta } from "./routes/Admin/progressoProposta/editProgresso";
import { getAllProgressoProposta } from "./routes/Admin/progressoProposta/getAllProgresso";
import { editProposta } from "./routes/Admin/proposta/editProposta";
import { deleteProposta } from "./routes/Admin/proposta/deleteProposta";
import { getAllPropostas } from "./routes/Admin/proposta/getAllPropostas";
import { createItemProposta } from "./routes/Admin/itemProposta/createItemProposta";
import { deleteItemProposta } from "./routes/Admin/itemProposta/deleteItemProposta";
import { getAllItemProposta } from "./routes/Admin/itemProposta/getAllItemProposta";
import { editItemProposta } from "./routes/Admin/itemProposta/editItemProposta";
import { createEdital } from "./routes/Admin/editalProposta/createEdital";
import { deleteEditalProposta } from "./routes/Admin/editalProposta/deleteEdital";
import { editEdital } from "./routes/Admin/editalProposta/editEdital";
import { editalGetAll } from "./routes/Admin/editalProposta/getAllEdital";
import { loginFornecedor } from "./routes/Admin/fornecedor/login";
import { getAllItemByProposta } from "./routes/Admin/itemProposta/getItemByProposta";
import { createBancoParaAdmin } from "./routes/Admin/banco/createBanco";
import { deleteBancoParaAdmin } from "./routes/Admin/banco/deleteBanco";
import { editBancoParaAdmin } from "./routes/Admin/banco/editBanco";
import { getAllBancoAdmin } from "./routes/Admin/banco/getAllBancoAdmin";
import { profilePhotoUserAdmin } from "./routes/Admin/user/profilePhoto";
import { forgotPassword } from "./routes/Admin/user/forgotPassword";
import { forgotValidatePassword } from "./routes/Admin/user/forgotValidatePassword";
import { getUserById } from "./routes/Admin/user/getUserById";
import { checkCodeLogin } from "./routes/Admin/fornecedor/checkAprovacao";
import { sendCodeLogin } from "./routes/Admin/fornecedor/againSendCode";
import { criarPropostaItem } from "./routes/Admin/fornecedor/itemProposta/criarPropostaItem";
import { approvedItem } from "./routes/Admin/fornecedor/itemProposta/aprovarPropostaItem";
import { approvedItemProposta } from "./routes/Admin/itemProposta/approvedItemPropostaFornecedor";
import { readItemProposta } from "./routes/Admin/itemProposta/readItemPropostaFornecedor";
import { getAllPropostasFornecedor } from "./routes/Admin/fornecedor/getAllPropostaFornecedor";
import { ReadPDF } from "./routes/Admin/PDF/readPDF";

const app = fastify();

// aqui determina qual o endereco do front-end que pode consumir nosso servidor
app.register(fastifyCors, {
  origin: "*"
});

app.register(fastifySwagger, {
  swagger: {
    consumes: ["application/json", "multipart/form-data"],
    produces: ["application/json"],
    info: {
      title: "pass.in",
      description:
        "Especificações da API para o back-end da aplicação Licitação",
      version: "1/"
    }
  },
  transform: jsonSchemaTransform
});

app.register(fastifySwaggerUI, {
  routePrefix: "/docs"
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
// app.register(fastifyMultipart, { attachFieldsToBody: true });

// Forgot Password
app.register(forgotPassword);
app.register(forgotValidatePassword);

// User
app.register(login);
app.register(getUserById);
app.register(createUser);
app.register(getAllUser);
app.register(editUser);
app.register(profilePhotoUserAdmin);
app.register(deleteUser);

// Fornecedor
app.register(loginFornecedor);
app.register(sendCodeLogin);
app.register(checkCodeLogin);
app.register(createFornecedor);
app.register(getAllPropostasFornecedor);
app.register(getAllFornecedor);
app.register(getFornecedor);
app.register(editFornecedor);
app.register(deleteFornecedor);
app.register(criarPropostaItem);
app.register(approvedItem);

// Proposta
app.register(getAllPropostas);
app.register(createProposta);
app.register(editProposta);
app.register(deleteProposta);

// Progresso Proposta
app.register(getAllProgressoProposta);
app.register(createProgressoProposta);
app.register(editProgressoProposta);
app.register(deleteProgressoProposta);

// Item Proposta
app.register(getAllItemProposta);
app.register(getAllItemByProposta);
app.register(editItemProposta);
app.register(createItemProposta);
app.register(deleteItemProposta);
app.register(approvedItemProposta);
app.register(readItemProposta);

//Edital Proposta
app.register(createEdital);
app.register(deleteEditalProposta);
app.register(editEdital);
app.register(editalGetAll);

// Banco Admin
app.register(createBancoParaAdmin);
app.register(deleteBancoParaAdmin);
app.register(editBancoParaAdmin);
app.register(getAllBancoAdmin);

// Ler PDF
app.register(ReadPDF);

app.setErrorHandler(errorHandler);

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("Server is running on port 3000");
});
