import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao Resgate de Projeto</h1>
        <p className="text-gray-500 mt-2">
          Leia este material antes de iniciar a atividade. Ele cobre os conceitos que você vai aplicar em cada fase.
        </p>
      </div>

      {/* Seção 1 — Story Points */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-700">📋 Metodologias Ágeis & Story Points</h2>
        <p className="text-gray-700 leading-relaxed">
          <strong>História do Cliente (User Story)</strong> descreve uma funcionalidade do ponto de vista
          do usuário final. Ex: <em>&ldquo;Como gerente, quero ver a folha salarial do time para controlar custos.&rdquo;</em>{" "}
          A história conecta o requisito ao valor de negócio — sem detalhar como implementar.
        </p>
        <p className="text-gray-700 leading-relaxed">
          <strong>Story Points</strong> medem a <em>complexidade relativa</em> de uma tarefa — não o tempo.
          Usamos a sequência de Fibonacci: <strong>1 · 2 · 3 · 5 · 8</strong>. Quanto maior o número,
          mais complexa e incerta a tarefa. Um item 8 não leva o dobro do tempo de um 4; ele significa que
          há o dobro de incerteza ou dependências ocultas. <strong>8 é o teto</strong> — se uma funcionalidade
          parece maior, o sinal é que ela deve ser dividida antes de ser estimada.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
          <p>💡 <strong>Por que Fibonacci?</strong> O salto entre os números reflete que estimativas de alta
          complexidade têm mais incerteza. Isso força o time a dividir tarefas grandes em menores antes de
          estimar.</p>
          <p>🃏 <strong>Planning Poker:</strong> cada membro vota independentemente; diferenças grandes
          disparam discussão — que é exatamente o objetivo, revelar suposições ocultas.</p>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Nesta atividade você vai estimar os Story Points <em>antes</em> de ver o código e depois
          <em> revisitar</em> essa estimativa após refatorar. A diferença entre as duas estimativas
          revela o quanto a complexidade estava escondida nos code smells do código legado.
        </p>
      </section>

      {/* Seção 2 — UML */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-700">🔷 UML — Diagrama de Classes</h2>
        <p className="text-gray-700 leading-relaxed">
          O Diagrama de Classes representa a <strong>estrutura estática</strong> do sistema: quais classes
          existem, quais atributos e métodos cada uma tem, e como elas se relacionam entre si. É o mapa
          do código — antes de escrever uma linha, o diagrama deixa claro quem conhece quem e quem depende de quem.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-800">Associação (1:N)</h3>
            <p className="text-sm text-gray-600">
              Um <strong>Time</strong> possui vários <strong>Jogadores</strong>. O Jogador conhece o Time,
              mas pode existir independentemente — se o time for dissolvido, o jogador continua no banco.
              Representada por uma linha simples com multiplicidade (1..*).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-800">Agregação</h3>
            <p className="text-sm text-gray-600">
              Uma <strong>Obra</strong> agrega <strong>Materiais</strong>. Se a Obra for cancelada, os
              Materiais continuam existindo no almoxarifado. O todo (Obra) referencia as partes (Materiais),
              mas não controla seu ciclo de vida. Representada por um losango vazio (◇).
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-800">Composição</h3>
            <p className="text-sm text-gray-600">
              Um <strong>Pedido</strong> contém <strong>Itens do Pedido</strong>. Se o Pedido for deletado,
              os Itens também são destruídos — eles não fazem sentido sem o pai. O ciclo de vida da parte
              depende totalmente do todo. Representada por um losango cheio (◆).
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          🔑 <strong>Regra prática:</strong> Pergunte &ldquo;a parte pode existir sem o todo?&rdquo; —
          Sim → Agregação. Não → Composição. Pergunte &ldquo;o todo e a parte têm ciclos de vida independentes
          com referência mútua?&rdquo; → Associação.
        </div>
      </section>

      {/* Seção 3 — Code Smells */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-700">🦨 Code Smells (Martin Fowler)</h2>
        <p className="text-gray-700 leading-relaxed">
          <strong>Code Smells</strong> são padrões no código que indicam problemas de design — não são bugs,
          o código funciona. Mas são sinais de que a estrutura vai dificultar manutenção, testes e evolução.
          Martin Fowler catalogou os principais em <em>Refactoring</em> (1999). Você vai identificar
          esses padrões no código legado do projeto que recebeu.
        </p>
        <div className="space-y-3">
          {[
            {
              name: "God Class",
              desc: "Uma única classe que faz tudo: calcula, persiste dados, exibe resultados e gerencia regras de negócio. Viola o Princípio da Responsabilidade Única (SRP) e se torna impossível de manter ou testar isoladamente. Solução: extrair classes com responsabilidade única.",
            },
            {
              name: "Feature Envy",
              desc: "Um método em classe A que acessa dados de classe B repetidamente — mais do que os próprios dados de A. Sinal de que esse método está no lugar errado e deveria estar em B. Solução: mover o método para a classe cujos dados ele mais usa.",
            },
            {
              name: "Long Method",
              desc: "Método com dezenas de linhas, múltiplos loops aninhados e condicionais encadeadas. Faz várias coisas ao mesmo tempo. Dificulta leitura, teste e reutilização. Solução: extrair trechos em métodos menores e bem nomeados.",
            },
            {
              name: "Data Class",
              desc: "Classe com apenas atributos getters/setters e zero comportamento. Toda lógica que deveria estar nela vazou para outra classe (geralmente a God Class). Solução: mover os comportamentos relevantes para dentro da classe.",
            },
            {
              name: "Long Parameter List",
              desc: "Construtor ou método com 5+ parâmetros primitivos. Indica que faltam objetos intermediários agrupando dados relacionados. Ex: em vez de (nome, rua, número, cidade, cep), criar um objeto Endereco. Solução: criar classes de valor.",
            },
            {
              name: "Primitive Obsession",
              desc: "Uso de tipos primitivos (String, int) para representar conceitos de domínio que mereciam uma classe. Ex: representar status de entrega como String &ldquo;ativo&rdquo;/&ldquo;cancelado&rdquo; em vez de um objeto com comportamento. Solução: criar classes de domínio ricas.",
            },
          ].map((smell) => (
            <div key={smell.name} className="bg-red-50 rounded-lg p-4 space-y-1">
              <p className="text-red-600 font-bold text-sm">🚩 {smell.name}</p>
              <p className="text-sm text-gray-700">{smell.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 4 — SRP */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-700">🎯 SRP — Princípio da Responsabilidade Única</h2>
        <p className="text-gray-700 leading-relaxed">
          <strong>&ldquo;Uma classe deve ter um único motivo para mudar.&rdquo;</strong> — Robert C. Martin
        </p>
        <p className="text-gray-700 leading-relaxed">
          Na prática: se você precisar adicionar uma nova regra de negócio e tiver que modificar a mesma
          classe que também cuida de persistência e de exibição, essa classe tem responsabilidades demais.
          Cada vez que qualquer uma dessas responsabilidades mudar, toda a classe fica em risco.
        </p>
        <p className="text-gray-700 leading-relaxed">
          A refatoração correta nesta disciplina <strong>não</strong> usa herança ou interfaces.
          Você deve <strong>extrair classes</strong> com responsabilidade única, <strong>criar objetos</strong>{" "}
          com comportamento próprio e <strong>delegar</strong> responsabilidades entre eles usando
          Associações e Agregações diretas.
        </p>
        <div className="bg-green-50 rounded-lg p-4 text-sm text-green-800 space-y-1">
          <p>✅ <strong>O que você PODE usar:</strong> Extração de Classes, Atributos bem nomeados, Métodos com responsabilidade única, Associações (1:1, 1:N), Agregações e Composições.</p>
          <p>❌ <strong>O que é PROIBIDO:</strong> <code>extends</code>, <code>implements</code>, Strategy, State, Observer, polimorfismo, classes abstratas.</p>
        </div>
      </section>

      {/* Seção 5 — MoSCoW */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold text-blue-700">📊 Matriz MoSCoW — Priorização</h2>
        <p className="text-gray-700 leading-relaxed">
          Depois de identificar os code smells e analisar o código, nem tudo pode (ou deve) ser
          refatorado ao mesmo tempo. A matriz MoSCoW é um framework de priorização que classifica
          cada funcionalidade em quatro categorias. Ela simula a decisão real de um tech lead
          explicando ao cliente o que vai e o que não vai entrar nesta sprint.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Must Have",
              color: "bg-red-100 text-red-800 border-red-200",
              desc: "Essencial. Sem isso o sistema não funciona ou não pode ser entregue. Não há negociação.",
              ex: "Ex: sem Cadastro de Jogadores, nada mais funciona.",
            },
            {
              label: "Should Have",
              color: "bg-orange-100 text-orange-800 border-orange-200",
              desc: "Importante e de alto valor, mas o sistema pode ser entregue sem. Forte candidato à próxima sprint.",
              ex: "Ex: Cálculo de Folha Salarial pode vir depois do MVP.",
            },
            {
              label: "Could Have",
              color: "bg-yellow-100 text-yellow-800 border-yellow-200",
              desc: "Desejável se houver tempo e recursos. Não compromete a entrega se ficar de fora.",
              ex: "Ex: Sorteio de Partidas é um plus, não um núcleo.",
            },
            {
              label: "Won't Have",
              color: "bg-gray-100 text-gray-700 border-gray-200",
              desc: "Explicitamente fora do escopo desta entrega. Documentar é importante para alinhar expectativas.",
              ex: "Ex: Interface gráfica não faz parte deste ciclo.",
            },
          ].map((item) => (
            <div key={item.label} className={`rounded-lg border p-4 space-y-1 ${item.color}`}>
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs">{item.desc}</p>
              <p className="text-xs opacity-70 italic">{item.ex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 6 — Como montar o PDF */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <h2 className="text-xl font-bold text-blue-700">Como montar o PDF de entrega</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Para cada problema corrigido, inclua uma seção no PDF seguindo exatamente esta estrutura.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Alerta de documentar durante */}
          <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-400 rounded-xl px-5 py-4">
            <span className="text-2xl shrink-0 mt-0.5">⚠️</span>
            <div className="space-y-1">
              <p className="font-black text-amber-800 uppercase tracking-wide text-sm">
                Documente enquanto edita — não deixe para o final!
              </p>
              <p className="text-sm text-amber-700 leading-relaxed">
                Antes de alterar qualquer linha, tire um <strong>print do código original</strong> com o problema destacado.
                Depois de refatorar, tire o <strong>print do código novo</strong>. Se você deixar para documentar no final,
                vai perder o &ldquo;antes&rdquo; — e sem o &ldquo;antes&rdquo; não há comparação possível.
              </p>
              <p className="text-sm font-bold text-amber-800 mt-1">
                Regra prática: abriu o arquivo para editar → print antes. Terminou a correção → print depois. Só então avance.
              </p>
            </div>
          </div>

          {/* Tabela de estrutura */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Estrutura de cada página (ou seção) do PDF — uma por problema corrigido:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {["Tipo de Bug", "Classe afetada", "Descrição do problema", "Código errado (print)", "Código corrigido (print)"].map((h) => (
                      <th key={h} className="border-r border-gray-200 last:border-0 px-4 py-3 text-left text-xs font-bold text-gray-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-600 align-top">
                      <span className="block font-semibold text-gray-700 mb-1">Um dos cinco:</span>
                      <span className="block text-red-600 font-medium">God Class</span>
                      <span className="block text-red-600 font-medium">Data Class</span>
                      <span className="block text-red-600 font-medium">Primitive Obsession</span>
                      <span className="block text-red-600 font-medium">Feature Envy</span>
                      <span className="block text-red-600 font-medium">Long Param List</span>
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-600 align-top">
                      Nome da classe e, se aplicável, o método específico.
                      <span className="block text-gray-400 mt-1">
                        Ex: <code className="bg-gray-100 px-1 rounded">Liga</code>,{" "}
                        <code className="bg-gray-100 px-1 rounded">GestorObras.cancelarObra</code>
                      </span>
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-600 align-top">
                      Explique o que está errado e por que viola boas práticas de POO
                      (SRP, associação, agregação, encapsulamento etc.)
                    </td>
                    <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-600 align-top">
                      Print do trecho <strong>original</strong> com o problema destacado (sublinhado, seta ou círculo).
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 align-top">
                      Print do trecho <strong>após a refatoração</strong>, mostrando a melhoria.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ordem MoSCoW */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0">📌</span>
            <p className="text-sm text-blue-800">
              <strong>Ordem no PDF = sua priorização MoSCoW.</strong> Apresente as correções na sequência:{" "}
              <strong>Must Have primeiro</strong>, depois Should Have, Could Have e Won&apos;t Have.
              Inclua somente as correções que você <em>realmente implementou</em> no código.
            </p>
          </div>
        </div>
      </section>

      {/* Navegação */}
      <div className="flex justify-between items-center pt-2">
        <Link
          href="/profile"
          className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors min-h-[48px] flex items-center"
        >
          ← Voltar ao Perfil
        </Link>
        <Link
          href="/phase1-estimation"
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors min-h-[48px] flex items-center"
        >
          Entendi — Iniciar Atividade →
        </Link>
      </div>
    </div>
  );
}
