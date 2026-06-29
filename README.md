<div align="center">

```
 ██████╗ ██╗   ██╗ █████╗ ██████╗ ██╗  ██╗██╗   ██╗███████╗
██╔═══██╗██║   ██║██╔══██╗██╔══██╗██║ ██╔╝██║   ██║██╔════╝
██║   ██║██║   ██║███████║██████╔╝█████╔╝ ██║   ██║███████╗
██║▄▄ ██║██║   ██║██╔══██║██╔══██╗██╔═██╗ ██║   ██║╚════██║
╚██████╔╝╚██████╔╝██║  ██║██║  ██║██║  ██╗╚██████╔╝███████║
 ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                         G U I D E
```

**Guia de estudos interativo para desenvolvedores Spring aprenderem Quarkus**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## ✨ Sobre o Projeto

O **Quarkus Guide** é um guia de estudos interativo construído em React, pensado para desenvolvedores que já conhecem o ecossistema Spring e querem aprender Quarkus de forma prática e comparativa.

Todo o conteúdo vive em **um único arquivo Markdown** (`src/data/knowledge.md`). Para acrescentar novos módulos ou seções, basta editá-lo — a interface se atualiza automaticamente.

---

## 🖥️ Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Q uarkus Guide          Spring → Quarkus    ⚡ Para devs Spring │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Progresso   │   Módulo 03 de 10                            │
│  ██████░░░░  │                                              │
│  30%         │   Injeção de Dependência (CDI)               │
│              │   ─────────────────────────────              │
│  ⌂ Início    │                                              │
│              │   ▌ De @Autowired para @Inject               │
│  01 Introdução│                                              │
│  02 Ambiente │   No Quarkus, a injeção de dependência é     │
│  03 CDI  ◄── │   baseada em CDI, não no container Spring.  │
│    · @Inject │                                              │
│    · Escopos │   Spring:                                    │
│    · @Config │   ┌─────────────────────────────────────┐   │
│  04 REST     │   │ @Service                             │   │
│  05 Panache  │   │ public class PedidoService {         │   │
│  ...         │   │   @Autowired                        │   │
│              │   │   private PedidoRepository repo;    │   │
│              │   └─────────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 📚 Conteúdo dos Módulos

| # | Módulo | Tópicos |
|---|--------|---------|
| 01 | **Introdução ao Quarkus** | O que é Quarkus, Spring vs Quarkus, por que migrar |
| 02 | **Configurando o Ambiente** | JDK, CLI, criando projetos, Dev Mode |
| 03 | **Injeção de Dependência (CDI)** | `@Inject`, escopos, qualifiers, `@ConfigProperty` |
| 04 | **REST com Quarkus** | `@Path`, verbos HTTP, tratamento de erros, query params |
| 05 | **Persistência com Panache** | Active Record, Repository pattern, queries, transações |
| 06 | **Configuração** | `application.properties`, perfis dev/prod/test, env vars |
| 07 | **Testes** | `@QuarkusTest`, REST Assured, `@InjectMock`, H2 |
| 08 | **Build e Deploy** | JVM build, native image, GraalVM, Docker |
| 09 | **Extensões Essenciais** | Kafka, Redis, JWT, OpenAPI, Health, Cache e mais |
| 10 | **Recursos para Continuar** | Docs, próximos passos, benchmarks de performance |

---

## ⚡ Tecnologias

- **[React 19](https://react.dev)** — UI
- **[Vite 8](https://vite.dev)** — Build e dev server
- **[react-markdown](https://github.com/remarkjs/react-markdown)** + **[remark-gfm](https://github.com/remarkjs/remark-gfm)** — Renderização do Markdown
- **[lucide-react](https://lucide.dev)** — Ícones

---

## 🚀 Deploy na Vercel

### Opção 1 — Via GitHub (recomendado)

```bash
# 1. Suba o projeto para um repositório GitHub
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/seu-usuario/quarkus-guide.git
git push -u origin main

# 2. Acesse vercel.com → "Add New Project" → importe o repositório
# 3. As configurações são detectadas automaticamente (Vite + React)
# 4. Clique em Deploy ✅
```

### Opção 2 — Via Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

> O arquivo `vercel.json` já está configurado com rewrite para SPA routing.

---

## 🛠️ Desenvolvimento Local

```bash
# Clonar e instalar
git clone https://github.com/seu-usuario/quarkus-guide.git
cd quarkus-guide
npm install

# Rodar em modo dev (com hot reload)
npm run dev
# → http://localhost:5173

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## ✏️ Como Adicionar Conteúdo

Todo o conhecimento do guia está em **um único arquivo**:

```
src/data/knowledge.md
```

A estrutura é simples — use `##` para módulos e `###` para seções:

```markdown
## Módulo 11: Segurança com JWT

### Adicionando a Extensão

```bash
quarkus ext add smallrye-jwt
```

### Configurando o application.properties

```properties
mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
mp.jwt.verify.issuer=https://meuapp.com
```

> 💡 **Dica:** Você pode usar todas as funcionalidades do Markdown:
> tabelas, blockquotes, listas e code blocks com syntax highlighting.
```

A UI detecta novos módulos e seções automaticamente — sem nenhuma alteração no código.

---

## 📁 Estrutura do Projeto

```
quarkus-guide/
├── src/
│   ├── data/
│   │   └── knowledge.md        ← ✏️  Edite aqui para adicionar conteúdo
│   ├── utils/
│   │   └── parseKnowledge.js   ← Parser que transforma o .md em módulos
│   ├── App.jsx                 ← Componente principal (layout, sidebar, navegação)
│   ├── main.jsx
│   └── index.css               ← Design system completo (CSS variables)
├── public/
│   └── favicon.svg
├── vercel.json                 ← SPA routing para Vercel
├── vite.config.js
└── package.json
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/novo-modulo`
3. Edite o `knowledge.md` com o novo conteúdo
4. Commit: `git commit -m "feat: adiciona módulo sobre Reactive Messaging"`
5. Abra um Pull Request

---

<div align="center">

Feito com ☕ para a comunidade Java brasileira

</div>
