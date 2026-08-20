# PRD — Sistema PBL "Resgate de Projeto" de POO

## Tipo de projeto

Sistema Web (Next.js + Firebase)

## Objetivo

Plataforma web para a disciplina de Programação Orientada a Objetos que simula um ambiente corporativo de "Resgate de Projeto". Alunos recebem código Java legado com falhas arquiteturais propositais, auditam, priorizam e entregam a refatoração, guiados por metodologias ágeis (Story Points, MoSCoW).

## Público-alvo

- **Aluno**: usa o sistema guiado pelas 8 telas sequenciais da atividade
- **Professor (Admin)**: monitora o progresso dos grupos e dispara o "Fator Surpresa"

## Problema que resolve

Transforma exercícios tradicionais de POO em uma simulação de ambiente corporativo com urgência real, forçando os alunos a praticar SRP, Associações, Agregações e Code Smells em código legado verdadeiro.

---

## Funcionalidades — Visão do Aluno

### Tela 1a — Login
- Autenticação via Firebase Auth (e-mail/senha)
- Mesmas credenciais do sistema `poo_essential_academy` (mesmo banco)
- Redireciona para `/profile` se `profileCompleted === false`, senão para `/onboarding`

### Tela 1b — Completar Perfil
- Campo: nomes dos integrantes do grupo (array de strings)
- Ao salvar: sortear `assignedRepoId` (1, 2 ou 3) e gravar em `users/{uid}`
- Sorteio ocorre **uma única vez** — nunca sobrescrever se já existir

### Tela 2 — Onboarding (conteúdo estático)
Explicar de forma visual e didática:
- História do Cliente, Story Points e sequência de Fibonacci
- UML: Classes, Associações (1:1, 1:N) e Agregações
- Code Smells (Martin Fowler): God Class, Feature Envy, Long Method, Data Class, Long Parameter List
- Princípio de Responsabilidade Única (SRP — o "S" do SOLID)
- Matriz de priorização MoSCoW

### Tela 3 — História do Cliente e Estimativa Inicial (Fase 1)
- Apresentar o Backlog (história do cliente) do projeto legado
- Tabela interativa: aluno atribui Story Points (1, 2, 3, 5, 8, 13) a cada funcionalidade
- Salvar em `submissions/{uid}.initialStoryPoints`
- Não pode avançar sem preencher todos os campos

### Tela 4 — Auditoria UML (Fase 2)
- Exibir imagem do Diagrama de Classes original da "equipe demitida"
- O diagrama contém até 5 problemas estruturais visíveis
- Aluno analisa visualmente (sem formulário nesta tela)

### Tela 5 — Repositório GitHub (Fase 3)
- Ler `assignedRepoId` de `users/{uid}` e exibir o link correspondente:
  - 1 → https://github.com/emanoelsp/lab1_poo1.git (Ligas Esportivas)
  - 2 → https://github.com/emanoelsp/lab1_poo2 (Obras e Empreendimentos)
  - 3 → https://github.com/emanoelsp/lab1_poo3 (Logística e Roteamento)
- Instruções para clonar e executar o projeto Java localmente

### Tela 6 — Matriz MoSCoW (Fase 4)
- Tabela interativa: Must Have / Should Have / Could Have / Won't Have
- Aluno arrasta ou seleciona cada problema encontrado para uma categoria
- Campo de texto obrigatório: justificativa da priorização
- Salvar em `submissions/{uid}.moscowMatrix` e `moscowJustification`

### Tela 7 — Fator Surpresa (modal global, disparado pelo admin)
- `onSnapshot` ouvindo `admin_triggers/surprise`
- Quando `isActive === true`: modal escandaloso cobre toda a tela
  - Cores: vermelho + amarelo piscante, z-index máximo
  - Sem botão "X" para fechar
  - Texto: nova regra de negócio urgente do "cliente"
  - Aluno deve digitar **"CIENTE"** para fechar
- Ao fechar: registrar confirmação em `submissions/{uid}.surpriseAcknowledged`

### Tela 8 — Entrega e Retrospectiva (Fase 5)
- Importar automaticamente `initialStoryPoints` (Tela 3) — somente leitura
- Tabela para preencher `finalStoryPoints` (pós-análise do código real)
- Comparativo visual automático: inicial vs. final com delta e justificativa
- Importar `moscowMatrix` da Tela 6 — somente leitura
- Campo: link do GitHub com o código refatorado
- Upload de PDF (Firebase Storage): prints "Antes/Depois" da refatoração
- Botão "Finalizar e Enviar" — só habilitar com todos os campos preenchidos

---

## Funcionalidades — Visão do Professor (Admin)

### Tela 9 — Painel Administrativo
- Lista em tempo real de todos os grupos (alunos)
- Para cada grupo: ver Story Points, Matriz MoSCoW, link do GitHub, visualizar PDF
- Botão vermelho **"Disparar Fator Surpresa"**: altera `admin_triggers/surprise.isActive` para `true` e grava a mensagem da nova regra

---

## Requisitos não funcionais

- RF-NF01: Sistema responsivo (mobile-first)
- RF-NF02: Autenticação compartilhada com `poo_essential_academy`
- RF-NF03: Realtime via `onSnapshot` para o Fator Surpresa
- RF-NF04: Upload de PDF via Firebase Storage
- RF-NF05: Testes E2E com Playwright cobrindo fluxo do aluno e do admin
- RF-NF06: Build limpo sem erros de TypeScript

## Critérios de aceite

- [ ] Aluno com conta existente no poo_essential_academy consegue fazer login
- [ ] Repositório sorteado não muda ao atualizar a página
- [ ] Fator Surpresa aparece em menos de 2 segundos após admin disparar
- [ ] Modal não fecha sem digitar "CIENTE"
- [ ] PDF enviado fica acessível via URL do Firebase Storage
- [ ] Admin vê todas as entregas em tempo real
- [ ] Build passa sem erro (`npm run build`)
- [ ] Testes E2E passam para ambos os perfis
