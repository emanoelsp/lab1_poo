# Contrato de Trabalho — Sistema PBL "Resgate de Projeto"

Você é o engenheiro fullstack responsável por construir este sistema. Leia este arquivo inteiro antes de qualquer ação.

## Leitura obrigatória antes de agir

- `docs/PRD.md` — requisitos completos das 9 telas e dos 3 repos Java
- `docs/ARCHITECTURE.md` — coleções Firestore, rotas e estrutura de pastas
- `docs/TASKS.md` — estado atual das tarefas
- `docs/TESTING.md` — estratégia de testes (Playwright E2E obrigatório)
- `docs/DESIGN.md` — padrões de UI/UX e Mobile UX
- `docs/AGENTS.md` — lista de skills disponíveis

## Contexto do projeto

Sistema web de Aprendizagem Baseada em Projetos (PBL) para a disciplina de Programação Orientada a Objetos. Simula um ambiente corporativo de "Resgate de Projeto de Software": alunos recebem código legado Java com falhas arquiteturais propositais e devem auditá-lo, priorizá-lo e refatorá-lo seguindo metodologias ágeis.

**Banco compartilhado:** Este projeto usa o mesmo Firebase (`pooessentialacademy`) do sistema `poo_essential_academy`. Alunos que já têm conta lá entram aqui com as mesmas credenciais — não criar nova coleção de usuários separada.

## Stack obrigatória

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js (App Router) + TypeScript estrito |
| Estilo | Tailwind CSS |
| Componentes | shadcn/ui |
| Ícones | lucide-react |
| Auth | Firebase Auth (projeto: pooessentialacademy) |
| Banco | Firestore (projeto: pooessentialacademy) |
| Storage | Firebase Storage (upload de PDFs) |
| Validação | Zod |
| Forms | React Hook Form |
| Estado global | Zustand |
| Deploy | Vercel |
| Testes E2E | Playwright |

## Estrutura de rotas (App Router)

```
/src/app
  /login                  → Tela 1a: autenticação
  /(student)              → grupo protegido: role = student
    /profile              → Tela 1b: completar perfil + assignedRepoId
    /onboarding           → Tela 2: conteúdo estático
    /phase1-estimation    → Tela 3: história + story points iniciais
    /phase2-uml           → Tela 4: diagrama UML para análise
    /phase3-repository    → Tela 5: link do repositório GitHub
    /phase4-moscow        → Tela 6: matriz MoSCoW
    /phase5-delivery      → Tela 8: entrega + retrospectiva
  /admin                  → grupo protegido: role = admin
    /dashboard            → Tela 9: lista de alunos e entregas
```

## Coleções Firestore

```
users/{uid}
  email, displayName, role: 'student'|'admin'
  groupMembers: string[]       ← nomes dos integrantes
  assignedRepoId: 1|2|3        ← sorteado uma única vez no primeiro perfil
  profileCompleted: boolean

submissions/{uid}
  initialStoryPoints: { [featureId]: number }
  finalStoryPoints:   { [featureId]: number }
  moscowMatrix:       { must: [], should: [], could: [], wont: [] }
  moscowJustification: string
  githubLink: string
  pdfUrl: string               ← URL do Firebase Storage
  surpriseAcknowledged: boolean
  submittedAt: Timestamp

admin_triggers/surprise
  isActive: boolean
  message: string
  activatedAt: Timestamp
```

## Repositórios Java legados

| assignedRepoId | Domínio | URL |
|---|---|---|
| 1 | Gestão de Ligas Esportivas | https://github.com/emanoelsp/lab1_poo1.git |
| 2 | Gestão de Obras e Empreendimentos | https://github.com/emanoelsp/lab1_poo2 |
| 3 | Logística e Roteamento | https://github.com/emanoelsp/lab1_poo3 |

## Regras críticas de POO (ementa Java)

Ao gerar código Java, é **PROIBIDO** usar:
- Herança (`extends`)
- Interfaces ou Polimorfismo (`implements`)
- Padrões de Projeto avançados (Strategy, State, Observer etc.)
- Problemas de encapsulamento (getters/setters, public/private)
- Menção a Liskov, classes abstratas ou sobrescrita de métodos

**Regra de Ouro:** Toda refatoração deve focar em:
1. Extração de Classes com responsabilidade única (SRP)
2. Criação de Objetos, Métodos e Atributos bem nomeados
3. Associações (1:1, 1:N) e Agregações corretas
4. Delegação de comportamento entre classes concretas

## Fator Surpresa — comportamento obrigatório

- `onSnapshot` global no layout `/(student)/layout.tsx` ouvindo `admin_triggers/surprise`
- Quando `isActive === true`: renderizar modal com `z-[9999]`, cores vermelhas/amarelas piscantes, sem botão "X"
- Modal só fecha quando aluno digitar **"CIENTE"** no input dedicado
- Ao confirmar: gravar `surpriseAcknowledged: true` em `submissions/{uid}`

## Aleatoriedade do repositório

- O sorteio acontece **uma única vez**: quando o aluno salva o perfil pela primeira vez
- Lógica: `Math.floor(Math.random() * 3) + 1` → salvar em `users/{uid}.assignedRepoId`
- A Tela 5 apenas lê esse campo e exibe o link correspondente

## Regras gerais

- Antes de codar, explique o plano
- Implemente uma etapa por vez
- Nunca quebre funcionalidades existentes
- Atualize `docs/TASKS.md` ao concluir cada tarefa
- Rode `lint` → `test` → `build` antes de finalizar
- Nunca commitar `.env.local` ou credenciais
- Nunca acessar Firestore diretamente em componentes — usar services em `/src/services/`
