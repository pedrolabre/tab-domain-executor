# VISION.md

## Visão do Produto

---

## 🎯 Motivação

### O Problema Real

Navegadores modernos são ambientes de trabalho complexos. É comum acumular dezenas, às vezes centenas de abas abertas distribuídas em múltiplas janelas. Entre essas abas, frequentemente encontramos:

- **Clusters de conteúdo relacionado**: 15 vídeos do YouTube abertos durante uma pesquisa
- **Sessões de trabalho antigas**: 20 abas de documentação de uma tarefa já concluída
- **Resíduos de navegação**: Múltiplas abas do mesmo site espalhadas por janelas diferentes

O gerenciamento manual dessas abas é:
- **Tedioso**: Clicar no "X" de cada aba individualmente
- **Propenso a erros**: Fechar a aba errada por engano
- **Sem contexto de escopo**: Não há visão clara de quantas abas de um domínio existem e onde estão
- **Irreversível**: Uma vez fechadas, as abas desaparecem sem possibilidade de recuperação imediata

### A Lacuna Existente

As extensões existentes geralmente seguem um destes caminhos:

1. **Gerenciadores automáticos**: Fecham abas automaticamente baseado em regras (tempo, uso de memória, etc.)
   - ❌ Problema: O usuário perde controle e pode ter abas importantes fechadas sem intenção

2. **Suspensores de abas**: Colocam abas inativas em suspensão
   - ❌ Problema: Não resolvem o problema de limpeza deliberada, apenas adiam

3. **Organizadores visuais**: Mostram todas as abas em uma interface alternativa
   - ❌ Problema: Foco em visualização, não em execução controlada de ações

4. **Ferramentas de produtividade genéricas**: Fazem muitas coisas, incluindo gerenciamento de abas
   - ❌ Problema: Complexidade excessiva, falta de foco em segurança para ações destrutivas

**Nenhuma dessas soluções oferece uma ferramenta focada, deliberada e segura para executar ações destrutivas com controle total do usuário.**

---

## 💡 A Solução: Tab Domain Executor

### Filosofia do Produto

O Tab Domain Executor é fundamentado em três pilares filosóficos:

#### 1. **Controle Total do Usuário**

> "Nenhuma ação sem intenção explícita"

- O sistema nunca assume o que o usuário quer
- Cada etapa exige uma decisão consciente
- O usuário pode parar o processo em qualquer ponto sem consequências

#### 2. **Segurança por Design**

> "Ações destrutivas exigem proteção estrutural"

- O fluxo é projetado para evitar erros acidentais
- Ações irreversíveis só são possíveis após múltiplas etapas de confirmação contextual
- Um mecanismo de recuperação oferece uma rede de segurança de 15 minutos

#### 3. **Transparência Absoluta**

> "O usuário sempre sabe exatamente o que vai acontecer"

- Nenhuma ação oculta ou comportamento em segundo plano
- Feedback visual claro em cada etapa
- Informações quantitativas sobre impacto (número de abas, janelas afetadas)

---

## 🔍 Caso de Uso Principal

### Cenário Típico

**Situação**: Um desenvolvedor está trabalhando em um projeto e acumulou 25 abas de documentação do Stack Overflow, 18 vídeos do YouTube sobre o framework que está aprendendo, e 12 abas do GitHub distribuídas em 3 janelas diferentes.

**Necessidade**: Ele terminou a pesquisa sobre o framework e quer fechar todas as abas do YouTube relacionadas, mas apenas na janela de trabalho atual, mantendo as da janela pessoal intactas.

**Solução com Tab Domain Executor**:

1. Abre a extensão
2. Clica em "Analisar Abas"
3. Vê que tem 18 abas do domínio `youtube.com` distribuídas em 2 janelas
4. Entra no domínio `youtube.com`
5. Escolhe "Selecionar Janelas"
6. Seleciona apenas a janela de trabalho (12 abas)
7. Vê a lista final das 12 abas específicas
8. Clica em "Fechar todas as abas"
9. As 12 abas são fechadas, mas as 6 abas pessoais permanecem abertas
10. Recebe um aviso de que pode recuperar a ação nos próximos 15 minutos

**Resultado**: Controle preciso, zero erros, total transparência.

---

## 🎨 Princípios de Design

### 1. Fluxo Linear e Determinístico

O sistema nunca permite atalhos ou saltos de etapa. O fluxo é sempre:

```
Estado Inicial
    ↓ (usuário clica "Analisar Abas")
Visualização de Domínios
    ↓ (usuário seleciona um domínio)
Seleção de Escopo
    ↓ (usuário escolhe "Todas as janelas" ou "Escolher janelas")
[Se "Escolher janelas"]
    ↓
Seleção de Janelas
    ↓
Lista Final de Abas
    ↓ (usuário executa ação destrutiva)
Execução e Feedback
```

Este fluxo garante que o usuário sempre saiba onde está e o que pode fazer.

### 2. Separação Clara de Níveis de Risco

- **Nível 1 - Visualização de Domínios**: Risco zero, apenas informação
- **Nível 2 - Seleção de Escopo**: Risco zero, apenas configuração
- **Nível 3 - Seleção de Janelas**: Risco zero, apenas refinamento
- **Nível 4 - Lista de Abas**: Risco alto, ações destrutivas disponíveis

Ações destrutivas só existem no nível final, após o contexto completo ter sido estabelecido.

### 3. Feedback Adequado ao Contexto

- **Antes da ação**: Mostrar claramente o que será afetado
- **Durante a ação**: (Opcional) Indicador de progresso para ações em lote
- **Após a ação**: Confirmação visual + opção de recuperação

### 4. Recuperação como Rede de Segurança

O mecanismo de recuperação não é apenas uma funcionalidade, é uma **filosofia de design**:

- Reconhece que erros acontecem
- Oferece perdão sem encorajar descuido
- Tem limite temporal para evitar acúmulo de dados
- É simples: um clique para desfazer

---

## 🚫 O Que Esta Visão NÃO Inclui

### Não é um Sistema de Produtividade

- Não há métricas de "abas economizadas"
- Não há gamificação ou incentivos para fechar abas
- Não há relatórios de uso ou estatísticas

### Não é um Gerenciador Automático

- Não fecha abas sem comando explícito
- Não sugere abas para fechar
- Não aprende padrões de uso

### Não é uma Ferramenta de Monitoramento

- Não rastreia histórico de navegação
- Não armazena dados além do log temporário de recuperação
- Não analisa comportamento do usuário

---

## 🎯 Objetivo Final

**Criar uma ferramenta focada, confiável e respeitosa que capacita o usuário a executar ações destrutivas com confiança, controle total e uma rede de segurança adequada.**

Esta extensão deve ser a referência de como projetar interfaces para ações de alto risco de forma que:
- Minimiza erros acidentais
- Maximiza transparência
- Respeita a agência do usuário
- Oferece recuperação quando necessário

---

## 📈 Visão de Futuro

### Fase Atual: MVP Focado
- Foco exclusivo em fechamento de abas por domínio
- Controle de escopo por janelas
- Mecanismo básico de recuperação

### Possíveis Evoluções Futuras
(Após validação do conceito e feedback de uso real)

- **Agrupamento por padrões de URL** (ex: `/docs/`, `/admin/`)
- **Exportação de listas de abas** antes do fechamento
- **Perfis de ação** (salvar configurações de escopo para reutilização)
- **Integração com gestores de sessão** (salvar grupos de abas como sessões nomeadas)

**Importante**: Qualquer evolução futura deve manter os princípios fundamentais de controle, segurança e transparência.

---

## 🎓 Valor como Projeto de Portfólio

Este projeto demonstra:

1. **Pensamento em UX para ações de alto risco**
   - Design defensivo contra erros
   - Fluxos de confirmação bem estruturados
   - Mecanismos de recuperação apropriados

2. **Arquitetura modular e escalável**
   - Separação clara de responsabilidades
   - Código preparado para crescer
   - Padrões de comunicação bem definidos

3. **Domínio de tecnologias modernas**
   - Chrome Manifest V3
   - TypeScript
   - Service Workers
   - Message Passing

4. **Maturidade de engenharia**
   - Documentação antes de código
   - Testes conceituais definidos
   - Estrutura de projeto profissional

---

**Próximo**: Leia [SCOPE.md](./SCOPE.md) para entender precisamente o que o projeto faz e o que deliberadamente NÃO faz.
