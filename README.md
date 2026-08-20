# 🚀 Project Template

Template padrão para projetos com **Next.js + Firebase + Cursor + Claude**.

## 📁 Estrutura

```
CLAUDE.md                   → Regras automáticas para o Claude Code (CLI)
.cursor/rules/project.mdc   → Regras automáticas para o Cursor
.claude/commands/           → Skills (slash commands) do Claude Code
.claude/agents/             → Subagentes especializados do Claude Code
docs/
  PRD.md          → Requisitos do produto
  ARCHITECTURE.md → Stack e arquitetura
  AGENTS.md       → Regras do agente e lista de skills
  TASKS.md        → Backlog e progresso
  TESTING.md      → Estratégia de testes
  DESIGN.md       → Design system e UI
  AI_AGENT.md     → Arquitetura de agentes IA (opcional)
  DEPLOY.md       → Checklist de deploy
.env.example      → Variáveis de ambiente necessárias
```

## ▶️ Como usar

### No Cursor

1. **Descompacte** este zip na pasta do seu projeto.
2. **Preencha** o `docs/PRD.md` com o objetivo do sistema.
3. **Abra o Cursor** na pasta do projeto.
4. **Diga ao Claude** (no Cursor):

```
Leia todos os arquivos em /docs.
Siga as regras em .cursor/rules/project.mdc.
Entenda o PRD.md e crie um plano de implementação.
Atualize TASKS.md e implemente a primeira etapa.
```

### No Claude Code (CLI)

O `CLAUDE.md` na raiz é lido automaticamente pelo Claude Code em toda sessão.

1. **Abra o terminal** na pasta do projeto e inicie o Claude Code:

```bash
claude
```

2. **Diga ao Claude**:

```
Leia todos os arquivos em /docs.
Entenda o PRD.md e crie um plano de implementação.
Atualize TASKS.md e implemente a primeira etapa.
```

3. **Skills disponíveis** via slash commands:

| Comando | Descrição |
|---------|-----------|
| `/active-learning` | Sessão de aprendizagem ativa com PBL e troubleshooting |

4. **Subagentes disponíveis** (invocados automaticamente ou via `use <nome>`):

| Subagente | Descrição |
|-----------|-----------|
| `ui-designer` | Layouts React/Tailwind com Mobile UX, thumb zone e WCAG 2.2 |

O agente vai ler toda a documentação, planejar e começar a codar.

## 🔑 Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

## 📌 Stack padrão

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Auth | Firebase Auth |
| Banco | Firestore |
| Deploy | Vercel |
| Testes | Jest + RTL + Playwright |
