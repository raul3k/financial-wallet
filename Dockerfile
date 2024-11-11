# Etapa 1: Construção da imagem
FROM node:18 as builder

# Define o diretório de trabalho no container
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia os arquivos do projeto para o diretório de trabalho
COPY . .

# Etapa 2: Produção
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia as dependências instaladas da etapa de builder
COPY --from=builder /app /app

# Exposição da porta 3000 para o container
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]
