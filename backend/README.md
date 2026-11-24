# BuscFísica API

API REST em Node.js + Express + PostgreSQL.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL local ou banco PostgreSQL gerenciado

## Configuração local

1. Copie `.env.example` para `.env`.
2. Preencha os dados de conexão com seu PostgreSQL.
3. Gere um `JWT_SECRET` aleatório com pelo menos 32 caracteres.
4. Instale as dependências e inicie:

```bash
npm install
npm run dev
```

A API inicia em `http://localhost:3000`. Teste `GET /health` para conferir a conexão.

## Banco de dados

Para criar as tabelas e inserir os dados iniciais, siga `../docs/INSTALACAO_LOCAL.md`.

A API aceita `DATABASE_URL` ou as variáveis individuais `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD` e `DB_PORT`. Para conexão TLS, configure `DB_SSL=true`.

## Vercel (etapa futura)

- Root Directory: `backend`
- Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` e `FRONTEND_ORIGIN`
- Endpoint de saúde: `/health`

Não publique arquivos `.env` nem credenciais no repositório.
