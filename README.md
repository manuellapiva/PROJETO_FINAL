# BuscFísica — Projeto Final SESI/SENAI

Plataforma de estudos de Física com questões de vestibulares, filtros por vestibular/matéria/tópico, correção de alternativas, explicações, videoaulas e consulta de fórmulas.

## O que está incluído

- **Frontend Web:** React + Vite + React Router, mantendo a identidade visual original.
- **Backend/API:** Node.js + Express + PostgreSQL, autenticação JWT e senhas com bcrypt.
- **Aplicativo Mobile:** React Native + Expo, autenticação e armazenamento seguro do token.
- **Banco:** scripts PostgreSQL com estrutura e dados iniciais do projeto.
- **Documentação:** instalação local, endpoints, arquitetura, usabilidade e apresentação.

## Estrutura do projeto

```text
BuscFisica_Projeto_Final/
├── backend/                 # API Express, autenticação, models, controllers e rotas
├── frontend/                # Aplicação React + Vite
├── mobile/                  # Aplicativo React Native + Expo
├── supabase/
│   ├── schema.sql           # Estrutura do PostgreSQL e view segura de listagem
│   └── seed.sql             # Dados iniciais
├── database/
│   └── BuscFisica_completo.sql # Script único: estrutura + dados
└── docs/                    # Instalação, API, arquitetura, usabilidade e pitch
```

## Começar pelo ambiente local

1. Leia `docs/INSTALACAO_LOCAL.md`.
2. Crie o banco PostgreSQL e execute os scripts na ordem indicada.
3. Configure e inicie o backend.
4. Configure e inicie o frontend Web.
5. Configure e inicie o Expo para testar o Mobile.

## Banco de dados

Use **uma** das opções:

- `supabase/schema.sql` e depois `supabase/seed.sql`; ou
- `database/BuscFisica_completo.sql` como script único em um banco vazio.

Os arquivos `supabase/` também podem ser usados futuramente no SQL Editor do Supabase. A publicação não é necessária para testar localmente.

## Segurança e comportamento

- Senhas são armazenadas com bcrypt.
- O backend valida tokens JWT nas rotas de conteúdo.
- O cadastro público cria apenas usuários comuns.
- Operações administrativas exigem perfil `admin`.
- A listagem de questões não retorna o gabarito; a resposta e a explicação são buscadas no detalhe após o estudante solicitar a correção.
- Arquivos `.env` reais não fazem parte do pacote. Crie-os a partir dos `.env.example`.

## Publicação

Supabase, Vercel, domínio, DNS, SSL/HTTPS e CI/CD ficam para a etapa posterior aos testes locais. Consulte `docs/ARQUITETURA.md` quando chegar a hora.

## Documentação

- `docs/INSTALACAO_LOCAL.md` — instalação e execução local.
- `docs/API.md` — endpoints e autenticação.
- `docs/ARQUITETURA.md` — arquitetura e implantação.
- `docs/USABILIDADE.md` — roteiro de testes com participantes.
- `docs/PITCH.md` — roteiro da apresentação.

**Importante:** o pacote foi revisado e preparado para testes locais. A execução final depende de configurar o PostgreSQL e instalar as dependências no computador de destino; não há credenciais de banco nem deploy real incluídos.
