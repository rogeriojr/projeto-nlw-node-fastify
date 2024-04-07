# Estágio de construção
FROM node:20 AS build
# Define um estágio de construção com base na imagem node:20.

# Instala o pnpm
RUN npm install -g pnpm
# Instala o gerenciador de pacotes pnpm globalmente dentro do contêiner.

WORKDIR /user/src/app
# Define o diretório de trabalho dentro do contêiner como /user/src/app.

# Copia o documento de instalação das dependências
COPY package.json pnpm-lock.yaml ./
# Copia os arquivos package.json e pnpm-lock.yaml do diretório de construção local para o diretório de trabalho dentro do contêiner.

# Prepara o projeto a nível de arquivos
RUN pnpm install
# Instala as dependências do projeto utilizando o pnpm com base nos arquivos package.json e pnpm-lock.yaml.

# Copiar todo o diretório
COPY . .
# Copia todos os arquivos e pastas do diretório de construção local para o diretório de trabalho dentro do contêiner.

RUN pnpm build
# Executa o comando pnpm build, que geralmente compila o código-fonte e prepara o aplicativo para a execução.

RUN pnpm prune --prod
# Remove as dependências de desenvolvimento do projeto utilizando o pnpm, reduzindo o tamanho final da imagem.

# Estágio de implantação
FROM node:20-alpine3.19 AS deploy
# Define um novo estágio com base na imagem node:20-alpine3.19. Este estágio será usado para implantar o aplicativo em um ambiente de produção.

WORKDIR /user/src/app
# Define o diretório de trabalho dentro do contêiner como /user/src/app.

RUN npm install -g pnpm prisma
# Instala globalmente o pnpm e o Prisma dentro do contêiner. O Prisma é uma ferramenta ORM (Object-Relational Mapping) para bancos de dados em Node.js.

# Copiar artefatos do estágio de compilação
COPY --from=build /user/src/app/dist ./dist
COPY --from=build /user/src/app/node_modules ./node_modules
COPY --from=build /user/src/app/package.json ./package.json
COPY --from=build /user/src/app/prisma ./prisma
# Copia os artefatos necessários do estágio de construção (build) para o estágio de implantação (deploy).

# Inserir uma variavel direta uma variavel do .env
# ENV DATABASE_URL="file:./db/sqlite"

RUN pnpm prisma generate
# Executa o comando pnpm prisma generate para gerar os artefatos necessários do Prisma para o ambiente de produção.

EXPOSE 3333
# Expõe a porta 3333 do contêiner, permitindo que o aplicativo seja acessado externamente através desta porta.

CMD ["pnpm", "start"]
# Define o comando padrão a ser executado quando o contêiner for iniciado. Neste caso, ele inicia o aplicativo utilizando o comando pnpm start.
