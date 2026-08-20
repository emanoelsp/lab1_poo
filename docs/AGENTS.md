# Regras do Agente

As regras completas estão em `CLAUDE.md` (raiz) para Claude Code e em `.cursor/rules/project.mdc` para o Cursor.

## Resumo rápido

- Leia toda a `/docs` antes de agir.
- Explique o plano antes de codar.
- Implemente uma etapa por vez.
- Atualize `TASKS.md` ao concluir cada tarefa.
- Rode `lint` → `test` → `build` antes de finalizar.
- Nunca use `extends` ou `implements` no código Java gerado.

## Skills disponíveis (Claude Code)

Localizadas em `.claude/commands/` — executar na ordem abaixo:

| Ordem | Skill | Descrição |
|-------|-------|-----------|
| 1 | `/pbl-init` | Setup base: Next.js + Firebase + middleware + services + stores + Playwright |
| 2 | `/pbl-screens` | Telas do aluno: Login, Perfil, Onboarding, Story Points, UML, Repo, MoSCoW, Entrega |
| 3 | `/pbl-surprise` | Fator Surpresa em tempo real + Painel Admin + testes E2E completos |
| 4 | `/pbl-java` | Gera os 3 repositórios Java legados com bugs arquiteturais propositais |
| — | `/active-learning` | Sessões de aprendizagem ativa com PBL e troubleshooting |

## Subagentes disponíveis (Claude Code)

Localizados em `.claude/agents/`:

| Subagente | Quando usar |
|-----------|------------|
| `ui-designer` | Revisar ou criar componentes com foco em Mobile UX, thumb zone e WCAG 2.2 |

## Restrições críticas de ementa Java

Ao chamar `/pbl-java` ou qualquer geração de código Java:

| PROIBIDO | PERMITIDO |
|----------|-----------|
| `extends` | Objetos concretos com composição |
| `implements` | Associações (1:1, 1:N) |
| Polimorfismo | Agregações |
| Strategy, State, Observer | SRP — extração de classes |
| Getters/setters como foco | Delegação de comportamento |
