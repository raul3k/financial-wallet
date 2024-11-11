# Financial Wallet
Desafio financial wallet.

# Requisitos
 1. Docker
 2. Docker Compose

# Postman
Para facilitar, você pode fazer o download da collection do postman, que se encontra em `/postman`.
Existem 2 collections, uma na versão 2 e outra na versão 2.1.

[Postman v2](postman/Financial%20Wallet%20API.postman_collection-v2.json)

[Postman v2.1](postman/Financial%20Wallet%20API.postman_collection-v2.1.json)

# Documentação
A documentação estará em `/api/docs`. 

# Rodando o projeto
Baixe o projeto, execute o `docker compose up`
Logo após, utilize outro terminal (ou coloque o `-d` no compose up) e execute o comando:

`docker compose exec app npx prisma db pull`

# Resumo das rotas:

## Autenticação (/auth)
* POST /auth/register - Registrar um novo usuário
* POST /auth/login - Login de usuário (retorna um token JWT)

## Carteira (/wallet)
* GET /wallet/balance - Consultar saldo da carteira do usuário
* PATCH /wallet/deposit - Depositar um valor na carteira do usuário
* PATCH /wallet/withdraw - Sacar um valor da carteira do usuário
* POST /wallet/transfer - Transferir saldo entre carteiras de usuários

## Transações (/transactions)
* GET /transactions - Listar todas as transações
* POST /transactions/:id/reverse - Reverter uma transação específica

## Usuários (/users)
* POST /users - Criar um novo usuário
* GET /users - Obter detalhes de um usuário específico

## Monitoramento (/monitoring)
* GET /monitoring/health - Checar a saúde da aplicação
* GET /monitoring/metrics - Obter métricas da aplicação para Prometheus
