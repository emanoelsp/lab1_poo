---
name: pbl-screens
description: Cria as telas do fluxo do aluno (Telas 1–6 e 8) do sistema PBL — Login, Perfil, Onboarding, Story Points, UML, Repositório GitHub, Matriz MoSCoW e Entrega. Execute após /pbl-init.
---

# /pbl-screens — Telas do Aluno

Leia `CLAUDE.md`, `docs/PRD.md` e `docs/DESIGN.md` antes de começar.
A base do projeto deve estar criada com `/pbl-init`.

---

## Tela 1a — Login (`/login/page.tsx`)

- Formulário: email + senha
- Usar Firebase Auth: `signInWithEmailAndPassword`
- Loading skeleton enquanto autentica
- Erro específico por código Firebase (ex: `auth/wrong-password` → "Senha incorreta")
- Após login: verificar `profileCompleted` → redirecionar para `/profile` ou `/onboarding`
- Link: "Acesse com sua conta do POO Essential Academy" (não criar conta nova aqui)

---

## Tela 1b — Completar Perfil (`/profile/page.tsx`)

- Formulário: nomes dos integrantes do grupo (mínimo 1, máximo 4)
- Validação Zod: array de strings não vazias
- Ao salvar: chamar `users.service.createProfile()` que:
  1. Verifica se `assignedRepoId` já existe (não sobrescrever)
  2. Sorteia `Math.floor(Math.random() * 3) + 1` e salva
  3. Grava `profileCompleted: true`
- Feedback visual de sucesso → redireciona para `/onboarding`

---

## Tela 2 — Onboarding (`/onboarding/page.tsx`)

Server Component (conteúdo estático). Dividir em seções com tabs ou accordion:

**Seção 1 — Metodologias Ágeis**
- O que é História do Cliente (User Story)
- O que são Story Points e como usar a sequência de Fibonacci (1, 2, 3, 5, 8, 13)
- Por que estimamos complexidade, não tempo

**Seção 2 — UML**
- Conceito de Diagrama de Classes
- Associações (1:1, 1:N) com exemplos visuais simples
- Agregações: "tem um" vs "é composto por"

**Seção 3 — Code Smells (Martin Fowler)**
- God Class: uma classe que faz tudo
- Feature Envy: método que inveja os dados de outra classe
- Long Method: método longo e confuso com loops aninhados
- Data Class (Classe Anêmica): só atributos, sem comportamento
- Long Parameter List: construtor com mais de 5 parâmetros

**Seção 4 — SRP (Responsabilidade Única)**
- Definição: cada classe deve ter um único motivo para mudar
- Exemplo prático de antes e depois
- Como aplicar: extrair classes, delegar comportamentos

**Seção 5 — Matriz MoSCoW**
- Must Have, Should Have, Could Have, Won't Have
- Como usar para priorizar bugs e refatorações

Botão "Entendi, começar a atividade" → redireciona para `/phase1-estimation`

---

## Tela 3 — Estimativa Inicial (`/phase1-estimation/page.tsx`)

**História do Cliente (texto estático):**
> "Você foi contratado para resgatar o projeto de uma equipe que foi demitida. O sistema deve [descrever o domínio do repositório atribuído — usar o `assignedRepoId` do usuário para mostrar a história correta]."

**Tabela de Story Points:**

| Funcionalidade | Descrição | Story Points |
|---|---|---|
| F001 | [nome] | Seletor: 1/2/3/5/8/13 |
| F002 | [nome] | Seletor: 1/2/3/5/8/13 |
| ... | | |

- Usar as funcionalidades dos 3 repositórios Java (definir lista por `assignedRepoId`)
- Salvar no Firestore ao clicar "Salvar Estimativas" via `submissions.service.saveInitialStoryPoints()`
- Não pode avançar sem preencher todos os Story Points

Botão "Próximo: Auditoria UML" → `/phase2-uml`

---

## Tela 4 — Auditoria UML (`/phase2-uml/page.tsx`)

Server Component.

- Exibir imagem do Diagrama de Classes UML original (usar `Next/Image`)
- Legenda explicativa dos 5 problemas estruturais visíveis no diagrama
- Texto: "Analise o diagrama antes de clonar o repositório"

Problemas no diagrama (adaptar por `assignedRepoId`):
1. Classe com muitas responsabilidades (God Class)
2. Atributo que deveria estar em outra classe
3. Associação representada incorretamente (1:N sem seta adequada)
4. Classe anêmica sem métodos
5. Dependência cíclica entre classes

Botão "Próximo: Baixar Repositório" → `/phase3-repository`

---

## Tela 5 — Repositório GitHub (`/phase3-repository/page.tsx`)

Client Component (lê `assignedRepoId` do Firestore).

Mapa de repositórios:
```typescript
const repos = {
  1: { name: 'Gestão de Ligas Esportivas', url: 'https://github.com/emanoelsp/lab1_poo1.git' },
  2: { name: 'Gestão de Obras e Empreendimentos', url: 'https://github.com/emanoelsp/lab1_poo2' },
  3: { name: 'Logística e Roteamento', url: 'https://github.com/emanoelsp/lab1_poo3' },
}
```

- Card destacado com o nome do domínio e botão "Copiar link" + botão "Abrir no GitHub"
- Instruções de clone e execução:
  ```bash
  git clone <url>
  cd <pasta>
  javac src/*.java
  java -cp src Main
  ```
- Aviso: "Este é o SEU repositório. Cada grupo recebe um domínio diferente."

Botão "Próximo: Matriz MoSCoW" → `/phase4-moscow`

---

## Tela 6 — Matriz MoSCoW (`/phase4-moscow/page.tsx`)

Client Component com estado local (React Hook Form + Zod).

**Lista de problemas a priorizar** (pré-definida, baseada nos bugs intencionais dos repos):
- God Class no Gerenciador principal
- Feature Envy no método de cálculo
- Long Parameter List no construtor
- Data Class (Classe Anêmica)
- Erro de Associação/Agregação (duplicação ou exclusão indevida)
- Long Method com loops aninhados
- Força bruta com if/else

**Interface:**
- 4 colunas: Must / Should / Could / Won't
- Cada problema como card arrastável (ou seletor dropdown simples)
- Campo de texto: "Justifique suas prioridades (mínimo 100 caracteres)"
- Validação Zod antes de salvar

Salvar via `submissions.service.saveMoscow()`.

Botão "Salvar e Continuar" → `/phase5-delivery`

---

## Tela 8 — Entrega e Retrospectiva (`/phase5-delivery/page.tsx`)

Client Component.

**Seção 1 — Comparativo de Story Points**
- Importar `initialStoryPoints` (somente leitura) de `submissions/{uid}`
- Tabela editável com coluna `finalStoryPoints` (mesmos seletores 1/2/3/5/8/13)
- Delta calculado automaticamente: final - inicial, com cor verde/vermelho
- Campo: "Por que a complexidade real diferiu da estimada?"

**Seção 2 — Matriz MoSCoW (leitura)**
- Importar e exibir o que foi preenchido na Tela 6 — sem edição

**Seção 3 — Artefatos da Entrega**
- Input: link do GitHub com o código refatorado (validação de URL)
- Upload de PDF: componente de drag-and-drop ou `<input type="file" accept=".pdf">`
  - Chamar `storage.service.uploadPdf()` → obter URL
  - Mostrar preview do nome do arquivo após upload

**Botão "Finalizar e Enviar"**
- Desabilitado até: `finalStoryPoints` preenchidos + justificativa + link GitHub + pdfUrl presente
- Ao clicar: chamar `submissions.service.finalizeSubmission()`
- Feedback de sucesso com confetti ou toast verde
- Após envio: tela de conclusão com resumo da atividade

---

## Verificação após implementar todas as telas

```bash
npm run build   # sem erros TypeScript
npm run lint    # sem warnings
npm run dev     # navegar por todas as telas manualmente
```

Atualizar TASKS.md marcando Sprint 1 como concluído.
