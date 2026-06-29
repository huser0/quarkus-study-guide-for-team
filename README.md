# Quarkus Guide — Para Devs Spring

Guia de estudos interativo para desenvolvedores Spring aprenderem Quarkus.

## Deploy na Vercel

**Via GitHub (recomendado):**
1. Faça push para o GitHub
2. Importe o repositório em vercel.com
3. As configurações são detectadas automaticamente (Vite + React)
4. Clique em Deploy

**Via CLI:**
```bash
npm install -g vercel
vercel --prod
```

## Como adicionar conteúdo

Todo o conteúdo fica em um único arquivo: `src/data/knowledge.md`

Estrutura:
- `## Título` → cria um novo módulo na sidebar
- `### Título` → cria uma seção dentro do módulo
- Markdown padrão (tabelas, code blocks, blockquotes) é suportado

A UI se adapta automaticamente ao número de módulos e seções.

## Desenvolvimento local

```bash
npm install
npm run dev    # hot reload
npm run build  # build produção
```
