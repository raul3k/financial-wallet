# Etapa 1: Construção da imagem
FROM node:18 as builder

# Define o diretório de trabalho no container
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia os arquivos do projeto para o diretório de trabalho
COPY . .

# Exposição da porta 3000 para o container
EXPOSE 3000

# Comando para rodar a aplicação em modo de desenvolvimento
CMD ["npm", "run", "start:dev"]
