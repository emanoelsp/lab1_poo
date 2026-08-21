"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useSubmission } from "@/hooks/useSubmission";
import { saveUmlAnswer } from "@/services/submissions.service";
import { MermaidDiagram } from "@/components/mermaid-diagram";

// ─── Diagrama Repo 1 — Gestão de Ligas Esportivas ────────────────────────────
const DIAGRAM_REPO_1 = `
classDiagram
    class Liga {
        <<God Class>>
        -String nome
        -List~Time~ times
        -List~Jogador~ jogadores
        -List~Partida~ partidas
        +cadastrarJogador(nome, posicao, salario, timeId) void
        +cadastrarTime(nome, cidade, capacidade) void
        +transferirJogador(jogId, origemId, destinoId) void
        +calcularFolhaSalarial(timeId) double
        +calcularEstatisticas() void
        +gerarClassificacao() void
        +sortearPartidas() void
        +buscarJogador(id) Jogador
        +salvarEmArquivo(caminho) void
    }
    class Time {
        <<Data Class>>
        -int id
        -String nome
        -String cidade
        -int capacidade
        +getId() int
        +getNome() String
        +getCidade() String
        +setId(id) void
        +setNome(nome) void
        +setCidade(c) void
        +setCapacidade(cap) void
    }
    class Jogador {
        <<Data Class>>
        -int id
        -String nome
        -String posicao
        -double salario
        -int timeId
        +getId() int
        +getNome() String
        +getSalario() double
        +getTimeId() int
        +setId(id) void
        +setSalario(s) void
        +setTimeId(id) void
    }
    class Partida {
        -int idMandante
        -int idVisitante
        -String data
        -int golsMandante
        -int golsVisitante
        -String local
        -int idArbitro
        +Partida(idM,idV,data,gM,gV,local,arb) void
        +getIdMandante() int
    }
    Liga "1" --> "N" Time : gerencia
    Liga "1" --> "N" Jogador : gerencia
    Liga "1" --> "N" Partida : gera
    Time "1" --> "N" Jogador : lista
`;

const ISSUES_REPO_1 = [
  {
    label: "God Class", placeholder: "Ex: MinhaClasse",
    hint: "Uma classe centraliza cadastro de entidades, lógica de transferência, cálculo financeiro e geração de relatórios da temporada.",
    answer: ["liga"],
    bigHint: "Dica: é o nome da competição esportiva que dá título ao sistema.",
    analysis: { where: "Liga", what: "God Class — viola o Princípio da Responsabilidade Única", why: "Liga possui 9+ métodos de domínios completamente diferentes: cadastro de jogadores, cadastro de times, transferência, cálculo de folha salarial, sorteio de partidas, estatísticas e persistência em arquivo. Qualquer alteração em qualquer uma dessas regras exige modificar a mesma classe, aumentando o risco de introduzir bugs em funcionalidades não relacionadas. A solução é extrair classes como CalculadoraSalarial, GerenciadorTransferencias e GeradorEstatisticas." },
  },
  {
    label: "Data Class", placeholder: "Ex: MinhaClasse",
    hint: "Uma entidade central do domínio não possui nenhum método de negócio — toda lógica a seu respeito está concentrada em outra classe.",
    answer: ["jogador"],
    bigHint: "Dica: é a entidade que corre atrás da bola e é transferida entre times.",
    analysis: { where: "Jogador", what: "Data Class — classe sem comportamento", why: "Jogador tem apenas getId, getNome, getSalario e setters. Toda lógica relacionada — validar se o salário é positivo, verificar se pode ser transferido — está em Liga. Isso quebra o encapsulamento: Liga conhece a estrutura interna de Jogador e a manipula diretamente. A solução é mover comportamentos como validarSalario() e estaDisponivel() para dentro da própria classe Jogador." },
  },
  {
    label: "Data Class", placeholder: "Ex: MinhaClasse",
    hint: "Agrupa membros mas não possui operações sobre eles. Não valida limites nem coordena ações internas.",
    answer: ["time"],
    bigHint: "Dica: é o grupo de entidades que compete na liga — não confunda com a liga em si.",
    analysis: { where: "Time", what: "Data Class — sem comportamento sobre seus próprios membros", why: "Time mantém uma lista de jogadores mas não possui métodos como adicionarJogador, removerJogador ou verificarCapacidade. A Liga faz tudo isso diretamente acessando os dados do Time. O Time deveria ser responsável por gerenciar seus próprios jogadores e validar se há espaço disponível antes de aceitar uma transferência." },
  },
  {
    label: "Feature Envy", placeholder: "Ex: Classe.metodo",
    hint: "Um método precisa acessar o identificador interno de um objeto e o estado de um segundo objeto para executar sua lógica — responsabilidade que pertence ao dono dos dados.",
    answer: ["liga.transferirjogador", "transferirjogador"],
    bigHint: "Dica: é um método da classe mais sobrecarregada — o verbo diz exatamente o que ele faz com uma entidade.",
    analysis: { where: "Liga.transferirJogador", what: "Feature Envy — método no lugar errado", why: "transferirJogador acessa jogador.getTimeId() e manipula diretamente as listas internas de Time para mover o jogador. Ele está mais interessado nos dados de Time e Jogador do que nos dados de Liga. A responsabilidade deveria ser de Time.removerJogador(jogador) e Time.adicionarJogador(jogador), com Liga apenas coordenando a chamada entre os dois times." },
  },
  {
    label: "Long Parameter List", placeholder: "Ex: MinhaClasse",
    hint: "Um construtor recebe múltiplos valores primitivos que representam conceitos distintos sem agrupá-los em objetos dedicados.",
    answer: ["partida"],
    bigHint: "Dica: é a classe que representa o confronto direto entre dois competidores em uma data e local específicos.",
    analysis: { where: "Partida", what: "Long Parameter List — 7 primitivos no construtor", why: "Partida(idMandante, idVisitante, data, golsMandante, golsVisitante, local, idArbitro) recebe 7 valores primitivos. Os placares poderiam ser agrupados em um objeto Placar(golsMandante, golsVisitante) e o local/data em um objeto LocalizacaoPartida. Além disso, idMandante e idVisitante são inteiros representando Times — deveriam ser referências diretas a objetos Time." },
  },
];

// ─── Diagrama Repo 2 — Gestão de Obras e Empreendimentos ─────────────────────
const DIAGRAM_REPO_2 = `
classDiagram
    class GestorObras {
        <<God Class>>
        -List~Obra~ obras
        -List~Material~ materiais
        -List~Funcionario~ funcionarios
        +cadastrarMaterial(nome, qtd, preco, unidade) void
        +cadastrarObra(nome, endereco, prazo, orcamento) void
        +alocarMaterial(obraId, materialId, qtd) void
        +cancelarObra(obraId) void
        +calcularCustoTotal(obraId) double
        +verificarEstoqueMinimo(materialId) boolean
        +devolverMateriais(obraId) void
        +gerarRelatorio(obraId) void
        +buscarObra(id) Obra
    }
    class Obra {
        <<Data Class>>
        -int id
        -String nome
        -String endereco
        -String prazo
        -double orcamento
        -String status
        -List~Integer~ materiaisIds
        +getId() int
        +getNome() String
        +getStatus() String
        +setStatus(s) void
        +setId(id) void
    }
    class Material {
        <<Data Class>>
        -int id
        -String nome
        -int quantidade
        -double preco
        -String unidade
        -int quantidadeMinima
        +getId() int
        +getQuantidade() int
        +setQuantidade(q) void
        +getPreco() double
    }
    class Funcionario {
        -int id
        -String nome
        -String cargo
        -double salario
        +getId() int
        +getNome() String
    }
    GestorObras "1" --> "N" Obra : gerencia
    GestorObras "1" --> "N" Material : controla
    GestorObras "1" --> "N" Funcionario : lista
    Obra --> Material : referencia por id
`;

const ISSUES_REPO_2 = [
  {
    label: "God Class", placeholder: "Ex: MinhaClasse",
    hint: "Uma classe controla cadastro, alocação de recursos, cancelamento, devolução e emissão de relatórios — todos os fluxos passam por ela.",
    answer: ["gestorobras"],
    bigHint: "Dica: o nome começa com 'Gestor' e termina com o domínio principal do sistema.",
    analysis: { where: "GestorObras", what: "God Class — centraliza todos os fluxos do domínio", why: "GestorObras tem 9 métodos abrangendo cadastro, alocação, cancelamento, verificação de estoque, devolução e relatório. Toda regra de negócio — seja ela financeira, operacional ou de controle de estoque — passa obrigatoriamente por ela. Qualquer nova feature ou bugfix aumenta ainda mais essa classe. A solução é extrair classes como ControladorEstoque, GerenciadorAlocacao e EmissorRelatorio." },
  },
  {
    label: "Primitive Obsession", placeholder: "Ex: Classe.atributo",
    hint: "Um estado com ciclo de vida definido é representado como texto simples, sem impedir valores inconsistentes entre transições.",
    answer: ["obra.status"],
    bigHint: "Dica: é um atributo da entidade principal que indica se ela está ativa, concluída ou cancelada.",
    analysis: { where: "Obra.status", what: "Primitive Obsession — estado de ciclo de vida como String", why: "O campo status é uma String que aceita qualquer valor. Um setStatus('invalido') passa sem erro. Além disso, não há validação de transição: uma obra 'concluida' pode ser redefinida como 'ativa' sem restrição. A solução é criar uma classe StatusObra com os estados válidos e um método que valide a transição antes de aplicá-la." },
  },
  {
    label: "Primitive Obsession", placeholder: "Ex: Classe.atributo",
    hint: "Uma classe mantém uma lista de identificadores numéricos referenciando objetos de outra classe, sem associação direta entre eles.",
    answer: ["obra.materiaisids", "obra.materiais"],
    bigHint: "Dica: é um atributo da mesma entidade do problema anterior — armazena referências a recursos físicos.",
    analysis: { where: "Obra.materiaisIds", what: "Primitive Obsession — lista de IDs no lugar de associação direta", why: "Obra armazena uma List<Integer> de IDs de Material. Para toda operação (alocar, devolver, calcular custo), GestorObras precisa percorrer essa lista e fazer um lookup manual pelo ID correspondente. Isso espalha lógica de busca por toda a classe. A solução é substituir por List<Material> com uma associação direta, eliminando todos os lookups manuais." },
  },
  {
    label: "Data Class", placeholder: "Ex: MinhaClasse",
    hint: "Um recurso físico do domínio não controla sua própria disponibilidade nem calcula seu custo total — toda essa lógica está em outro lugar.",
    answer: ["material"],
    bigHint: "Dica: é a entidade que representa o que é consumido fisicamente durante a execução de uma obra.",
    analysis: { where: "Material", what: "Data Class — sem comportamento sobre seu próprio estoque", why: "Material possui apenas getters e setters. A verificação de estoque mínimo (verificarEstoqueMinimo) e o cálculo de custo (calcularCustoTotal) ficam em GestorObras, que acessa os campos de Material diretamente. Material deveria ter métodos como estaAbaixoDoMinimo() e calcularCusto(quantidade) para encapsular sua própria lógica." },
  },
  {
    label: "Feature Envy", placeholder: "Ex: Classe.metodo",
    hint: "Um método percorre e modifica estados de dois tipos distintos de objetos — lógica que pertenceria às próprias classes afetadas.",
    answer: ["gestorobras.cancelarobra", "cancelarobra"],
    bigHint: "Dica: é o método que encerra uma entidade e devolve recursos ao estoque.",
    analysis: { where: "GestorObras.cancelarObra", what: "Feature Envy — método operando dados de outras classes", why: "cancelarObra acessa obra.getMateriaisIds(), busca cada Material pelo ID, lê material.getQuantidade() e chama material.setQuantidade() para devolver o estoque. Ele está mais interessado nos dados de Obra e Material do que de GestorObras. A lógica deveria ser: obra.cancelar() que internamente chama material.repor(quantidade) para cada item alocado." },
  },
];

// ─── Diagrama Repo 3 — Logística e Roteamento ────────────────────────────────
const DIAGRAM_REPO_3 = `
classDiagram
    class SistemaLogistica {
        <<God Class>>
        -List~Caminhao~ caminhoes
        -List~Carga~ cargas
        -List~Entrega~ entregas
        +cadastrarCarga(tipo, peso, destino, prioridade) void
        +cadastrarCaminhao(placa, capacidade, motorista) void
        +alocarCarga(cargaId, caminhaoPlaca) void
        +avancarStatus(entregaId) void
        +calcularRotaOtima(caminhaoPlaca) void
        +cancelarEntrega(entregaId) void
        +gerarManifesto(caminhaoPlaca) void
        +buscarCaminhao(placa) Caminhao
    }
    class Caminhao {
        <<Data Class>>
        -String placa
        -double capacidadeMaxima
        -double cargaAtual
        -String motorista
        -List~Integer~ cargaIds
        +getPlaca() String
        +getCapacidadeMaxima() double
        +getCargaAtual() double
        +setCargaAtual(c) void
        +getCargaIds() List
    }
    class Carga {
        <<Data Class>>
        -int id
        -String tipo
        -double peso
        -String destino
        -int prioridade
        -String status
        +getId() int
        +getPeso() double
        +getStatus() String
        +setStatus(s) void
    }
    class Entrega {
        -int id
        -String status
        -String caminhaoPlaca
        -int cargaId
        -String dataInicio
        +Entrega(id,placa,cargaId,data,status) void
        +getStatus() String
        +setStatus(s) void
    }
    SistemaLogistica "1" --> "N" Caminhao : controla
    SistemaLogistica "1" --> "N" Carga : gerencia
    SistemaLogistica "1" --> "N" Entrega : registra
    Caminhao --> Carga : referencia por id
`;

const ISSUES_REPO_3 = [
  {
    label: "God Class", placeholder: "Ex: MinhaClasse",
    hint: "Uma classe controla alocação de recursos, transições de estado, cálculo de rota, cancelamento e geração de documentos operacionais.",
    answer: ["sistemalogistica"],
    bigHint: "Dica: o nome começa com 'Sistema' e termina com o domínio principal do negócio.",
    analysis: { where: "SistemaLogistica", what: "God Class — única classe com comportamento real", why: "SistemaLogistica acumula 8 métodos cobrindo alocação de cargas, avanço de status, cálculo de rota ótima, cancelamento de entrega e geração de manifesto. As demais classes (Caminhao, Carga, Entrega) são apenas contêineres de dados. Toda lógica de negócio passa por SistemaLogistica, tornando impossible testar ou modificar uma regra sem risco de quebrar outra. Classes como GerenciadorAlocacao e CalculadorRota deveriam existir." },
  },
  {
    label: "Primitive Obsession", placeholder: "Ex: Classe.atributo",
    hint: "Um fluxo de estados é representado por texto simples, sem garantir que as transições ocorram em ordem válida.",
    answer: ["carga.status"],
    bigHint: "Dica: é um atributo da entidade que é embarcada nos veículos de transporte.",
    analysis: { where: "Carga.status", what: "Primitive Obsession — estados de entrega como String", why: "O campo status aceita qualquer string: 'aguardando', 'em_transito', 'concluida', 'cancelada'. Não há validação de transição — avancarStatus pode colocar 'concluida' direto em uma carga ainda 'aguardando', ou reativar uma carga 'cancelada'. Uma classe StatusCarga com método podeAvancarPara(novoStatus) resolveria isso garantindo a ordem correta do fluxo." },
  },
  {
    label: "Primitive Obsession", placeholder: "Ex: Classe.atributo",
    hint: "Uma classe mantém referências a outras por meio de identificadores numéricos em vez de associações diretas entre objetos.",
    answer: ["caminhao.cargaids", "caminhao.cargas"],
    bigHint: "Dica: é um atributo do veículo — deveria ser uma lista de objetos, não de números inteiros.",
    analysis: { where: "Caminhao.cargaIds", what: "Primitive Obsession — lista de IDs no lugar de associação", why: "Caminhao armazena List<Integer> de IDs de Carga. A cada alocação, cancelamento ou geração de manifesto, SistemaLogistica percorre essa lista e busca o objeto Carga correspondente manualmente. Isso cria código de busca repetido e acoplamento desnecessário. Substituir por List<Carga> permite que Caminhao calcule sua própria capacidade restante e gerencie suas cargas diretamente." },
  },
  {
    label: "Feature Envy", placeholder: "Ex: Classe.metodo",
    hint: "Um método acessa atributos internos de objetos de outra classe para realizar ordenação — essa lógica pertenceria àqueles objetos.",
    answer: ["sistemalogistica.calcularrotaotima", "calcularrotaotima"],
    bigHint: "Dica: é o método que determina a sequência ideal de paradas do veículo com base em atributos das cargas.",
    analysis: { where: "SistemaLogistica.calcularRotaOtima", what: "Feature Envy — lógica de ordenação no lugar errado", why: "calcularRotaOtima percorre todas as cargas do caminhão e acessa carga.getPeso(), carga.getDestino() e carga.getPrioridade() para ordenar as entregas. Esse método está mais interessado nos dados de Carga do que nos de SistemaLogistica. A solução é criar uma classe Rota com método otimizar(List<Carga>) ou adicionar um método comparar(outraCarga) em Carga para encapsular o critério de ordenação." },
  },
  {
    label: "Long Parameter List", placeholder: "Ex: MinhaClasse",
    hint: "Um construtor recebe múltiplos primitivos — identificadores, datas e estados — sem agrupá-los em objetos que representem os conceitos envolvidos.",
    answer: ["entrega"],
    bigHint: "Dica: é a classe que registra o ato de transportar uma carga do ponto de origem ao destino.",
    analysis: { where: "Entrega", what: "Long Parameter List — 5 primitivos no construtor", why: "Entrega(id, caminhaoPlaca, cargaId, dataInicio, status) recebe 5 valores primitivos misturando identificadores (int, String) com metadados (data, status). caminhaoPlaca é uma String que deveria ser uma referência ao objeto Caminhao; cargaId deveria ser uma referência a Carga; status deveria ser um StatusEntrega. A criação de objetos de valor eliminaria esse construtor frágil e tornaria o código autodocumentado." },
  },
];

type Analysis = { where: string; what: string; why: string };
type Issue = { label: string; hint: string; answer: string[]; placeholder: string; bigHint: string; analysis: Analysis };
type RepoData = { diagram: string; issues: Issue[]; title: string };

const REPO_DATA: Record<number, RepoData> = {
  1: { diagram: DIAGRAM_REPO_1, issues: ISSUES_REPO_1, title: "Gestão de Ligas Esportivas" },
  2: { diagram: DIAGRAM_REPO_2, issues: ISSUES_REPO_2, title: "Gestão de Obras e Empreendimentos" },
  3: { diagram: DIAGRAM_REPO_3, issues: ISSUES_REPO_3, title: "Logística e Roteamento" },
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export default function Phase2Page() {
  const { user } = useAuthStore();
  const { submission, loading } = useSubmission(user?.uid);
  const repoId = (user?.assignedRepoId ?? 1) as 1 | 2 | 3;
  const { diagram, issues, title } = REPO_DATA[repoId] ?? REPO_DATA[1];

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [hintRound, setHintRound] = useState<Record<number, number>>({});
  const [bigHintIdx, setBigHintIdx] = useState<number | null>(null);
  const [revealIdx, setRevealIdx] = useState<number | null>(null);
  const [revealVisible, setRevealVisible] = useState(false);

  function isCorrect(i: number) {
    return issues[i].answer.includes(normalize(inputs[i] ?? ""));
  }

  const allCorrect = issues.every((_, i) => isCorrect(i));

  // Restaura respostas corretas salvas no Firestore
  useEffect(() => {
    if (!submission?.umlAnswers) return;
    const restored: Record<number, string> = {};
    issues.forEach((_, i) => {
      const saved = submission.umlAnswers?.[`${repoId}_${i}`];
      if (saved) restored[i] = saved;
    });
    if (Object.keys(restored).length > 0) {
      setInputs((prev) => ({ ...prev, ...restored }));
    }
  }, [submission, repoId, issues]);

  // Salva todas as corretas quando o aluno completa a fase (garante persistência)
  useEffect(() => {
    if (!allCorrect || !user?.uid) return;
    issues.forEach((issue, i) => {
      const val = inputs[i] ?? "";
      if (issue.answer.includes(normalize(val))) {
        saveUmlAnswer(user.uid!, `${repoId}_${i}`, val).catch(() => null);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCorrect]);

  function recordWrongAttempt(i: number) {
    setAttempts((prev) => {
      const next = (prev[i] ?? 0) + 1;
      if (next >= 5) {
        const round = hintRound[i] ?? 0;
        if (round === 0) {
          setBigHintIdx(i);
          setHintRound((r) => ({ ...r, [i]: 1 }));
        } else {
          setRevealIdx(i);
          setRevealVisible(false);
        }
        return { ...prev, [i]: 0 };
      }
      return { ...prev, [i]: next };
    });
  }

  function handleBlur(i: number, domVal: string) {
    // usa o valor direto do DOM para evitar leitura de estado stale
    const val = domVal.trim().length > 0 ? domVal : (inputs[i] ?? "");
    if (val.trim().length === 0) return;
    if (issues[i].answer.includes(normalize(val))) {
      if (user?.uid) {
        saveUmlAnswer(user.uid, `${repoId}_${i}`, val).catch(() => null);
      }
    } else {
      recordWrongAttempt(i);
    }
  }

  function handleChange(i: number, val: string) {
    setInputs((prev) => ({ ...prev, [i]: val }));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fase 1 — Auditoria UML</h1>
          <p className="text-gray-500 mt-1">
            Diagrama de classes do sistema <strong>{title}</strong> deixado pela equipe anterior.
            Identifique os problemas e preencha qual classe ou método está afetado.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-amber-700">
          {["God Class", "Data Class", "Feature Envy", "Primitive Obsession", "Long Parameter List"].map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Diagrama full-width */}
      <div style={{ width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }}>
        <MermaidDiagram definition={diagram} height={600} />
      </div>

      {/* Problemas com inputs */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              🚩 {issues.length} pontos de atenção — identifique onde cada problema ocorre
            </h2>
            <span className="text-sm text-gray-400">
              {issues.filter((_, i) => isCorrect(i)).length}/{issues.length} corretos
            </span>
          </div>

          <div className="space-y-3">
            {issues.map((issue, i) => {
              const val = inputs[i] ?? "";
              const touched = val.trim().length > 0;
              const correct = isCorrect(i);
              const wrong = touched && !correct;

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-colors ${
                    correct
                      ? "bg-green-50 border-green-200"
                      : wrong
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Lado esquerdo — smell + hint */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          correct ? "bg-green-100 text-green-700" :
                          wrong ? "bg-red-100 text-red-700" :
                          "bg-gray-200 text-gray-600"
                        }`}>
                          {issue.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{issue.hint}</p>
                    </div>

                    {/* Lado direito — input */}
                    <div className="sm:w-64 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 block">
                        Qual classe ou método?
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onBlur={(e) => handleBlur(i, e.target.value)}
                          disabled={correct}
                          placeholder={issue.placeholder}
                          className={`w-full px-3 py-2 pr-9 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors ${
                            correct
                              ? "bg-green-100 border-green-300 text-green-800 cursor-default"
                              : wrong
                              ? "border-red-300 focus:ring-red-200 bg-white"
                              : "border-gray-300 focus:ring-blue-200 bg-white"
                          }`}
                        />
                        {correct && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-600 text-base">✓</span>
                        )}
                        {wrong && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-400 text-base">✗</span>
                        )}
                      </div>
                      {wrong && (
                        <p className="text-xs text-red-500">
                          Tente novamente. {(attempts[i] ?? 0) >= 3 && (attempts[i] ?? 0) < 5
                            ? `(${5 - (attempts[i] ?? 0)} tentativas até a dica)`
                            : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allCorrect && (
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 text-center text-green-800 font-semibold">
              ✅ Todos os problemas identificados corretamente! Você pode avançar.
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Próximo passo:</strong> Clone o repositório, leia o código Java e confirme esses problemas na prática. Na Fase 4 você vai priorizar o que refatorar.
        </div>

        <div className="flex justify-between">
          <Link href="/onboarding" className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center">
            ← Voltar
          </Link>
          {allCorrect ? (
            <Link href="/phase1-estimation" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors min-h-[48px] flex items-center">
              Próximo: Estimar Story Points →
            </Link>
          ) : (
            <button
              disabled
              className="px-8 py-3 bg-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed min-h-[48px] flex items-center gap-2"
              title="Identifique todos os problemas para avançar"
            >
              🔒 Identifique todos os {issues.length} problemas para avançar
            </button>
          )}
        </div>
      </div>

      {/* Modal 1 — Dica escandalosa (após 5 erros) */}
      {bigHintIdx !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 animate-pulse" />
          <div
            className="relative bg-yellow-400 border-4 border-red-600 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce"
            style={{ animationIterationCount: 3, animationFillMode: "forwards" }}
          >
            <div className="text-5xl mb-3">🚨</div>
            <h3 className="text-2xl font-black text-red-700 uppercase tracking-wide mb-2">
              Atenção, aluno!
            </h3>
            <p className="text-red-800 font-bold text-sm mb-4">
              Problema #{bigHintIdx + 1} — {issues[bigHintIdx].label}
            </p>
            <div className="bg-white border-2 border-red-400 rounded-2xl p-4 text-left mb-6">
              <p className="text-xs font-bold text-red-500 uppercase mb-1">Dica (quase entregando...)</p>
              <p className="text-gray-800 text-sm font-medium">{issues[bigHintIdx].bigHint}</p>
            </div>
            <button
              onClick={() => setBigHintIdx(null)}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-lg transition-colors min-h-[48px]"
            >
              ENTENDI, VOU TENTAR DE NOVO!
            </button>
          </div>
        </div>
      )}

      {/* Modal 2 — Revelação completa (após mais 5 erros) */}
      {revealIdx !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setRevealIdx(null)} />
          <div className="relative bg-white border-2 border-gray-300 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-xl font-black text-gray-900">
                Problema #{revealIdx + 1} — {issues[revealIdx].label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Muitas tentativas sem acerto. Veja a análise completa abaixo.
              </p>
            </div>

            {!revealVisible ? (
              <div className="text-center py-4">
                <button
                  onClick={() => setRevealVisible(true)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base transition-all hover:scale-105 active:scale-95 min-h-[52px] shadow-lg"
                >
                  🔓 Clique aqui para revelar a resposta
                </button>
              </div>
            ) : (
              <div
                className="space-y-4 overflow-hidden"
                style={{ animation: "revealSlide 0.6s cubic-bezier(0.22,1,0.36,1) forwards" }}
              >
                <style>{`
                  @keyframes revealSlide {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                  }
                `}</style>

                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Resposta</p>
                  <p className="text-2xl font-black text-indigo-900 font-mono">{issues[revealIdx].analysis.where}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">O que é</p>
                  <p className="text-sm font-semibold text-gray-800">{issues[revealIdx].analysis.what}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Por que é um problema</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{issues[revealIdx].analysis.why}</p>
                </div>

                <button
                  onClick={() => {
                    const answer = issues[revealIdx].analysis.where;
                    setInputs((prev) => ({ ...prev, [revealIdx]: answer }));
                    if (user?.uid) {
                      saveUmlAnswer(user.uid, `${repoId}_${revealIdx}`, answer).catch(() => null);
                    }
                    setRevealIdx(null);
                    setRevealVisible(false);
                  }}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors min-h-[48px]"
                >
                  Entendido — continuar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
