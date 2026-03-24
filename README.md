# GroceryHelper

O GroceryHelper é uma aplicação web criada para ajudar famílias a organizarem suas compras domésticas de forma simples, inteligente e eficiente.

A aplicação permite controlar os itens da casa, identificar o que está acabando, sugerir compras automaticamente e destacar produtos que estão em uma boa época para comprar.

---

# Domínio do Problema

Gerenciar as compras de casa é uma tarefa recorrente e, muitas vezes, desorganizada. Entre os principais problemas enfrentados pelas famílias estão:

- Esquecer de comprar itens essenciais
- Comprar produtos que já existem em casa
- Desperdício de alimentos por vencimento
- Falta de noção do que está em época (e mais barato)
- Dificuldade de coordenar compras entre membros da família
- Falta de controle sobre padrões de consumo

Grande parte das famílias utiliza:
- Listas em papel
- Bloco de notas no celular
- Memória
- Ou só percebem a falta quando o item acaba

Essas abordagens são reativas, não preventivas.

O GroceryHelper propõe transformar a gestão de compras em algo mais inteligente e preditivo.

---

# Objetivo do Projeto

Desenvolver uma aplicação web que:

1. Controle o estoque doméstico
2. Identifique automaticamente itens com baixo estoque
3. Sugira compras com base no consumo
4. Destaque produtos sazonais
5. Reduza desperdícios
6. Facilite o planejamento financeiro
7. Permita uso colaborativo entre membros da família

---

# Público-Alvo

- Famílias
- Casais
- Pessoas que moram sozinhas
- Lares que desejam economizar
- Usuários interessados em organização doméstica

---

# Funcionalidades Principais (Planejadas)

## 1. Gestão de Despensa
- Cadastro de itens
- Controle de quantidade
- Organização por categorias
- Registro de data de validade

## 2. Detecção de Estoque Baixo
- Definição de quantidade mínima
- Alertas automáticos
- Sugestão baseada na frequência de consumo

## 3. Lista de Compras Inteligente
- Geração automática de lista
- Inclusão manual de itens
- Sugestão de quantidade ideal
- Sugestão de itens sazonais

## 4. Sazonalidade
- Indicação de frutas e verduras da estação
- Sugestão de alternativas mais econômicas
- Calendário sazonal

## 5. Controle de Consumo
- Histórico de compras
- Análise de frequência
- Base para sugestões futuras

## 6. Uso Colaborativo
- Compartilhamento por família
- Múltiplos usuários
- Atualização em tempo real

---

# Modelo de Domínio (Visão Geral)

## Entidades Principais

### Usuário
- id
- nome
- email
- household_id

### Família (Household)
- id
- nome

### Item
- id
- nome
- categoria
- quantidade
- unidade (kg, unidade, litro, etc.)
- quantidade_minima
- data_validade
- household_id

### ListaDeCompras
- id
- household_id
- data_criacao

### ItemListaDeCompras
- id
- item_id
- quantidade
- status (pendente, comprado)

### Sazonalidade
- id
- produto
- meses_ideais
- regiao

---

# Fluxos Principais

## 1. Cadastro de Itens
Usuário adiciona itens após a compra.

## 2. Atualização de Consumo
Usuário reduz quantidades conforme consumo.

## 3. Alerta de Estoque Baixo
Sistema compara quantidade atual com quantidade mínima.

## 4. Sugestões Inteligentes
Sistema analisa:
- Frequência de consumo
- Histórico de compras
- Sazonalidade

## 5. Geração de Lista
Sistema sugere automaticamente itens a serem comprados.

---

# Evoluções Futuras

- Leitura de código de barras
- Leitura automática de notas fiscais (OCR)
- Integração com supermercados
- Controle de orçamento
- Histórico de preços
- Planejamento de refeições
- Inteligência artificial para previsão de consumo

---

# Visão do Produto

O GroceryHelper busca se tornar um assistente doméstico inteligente, reduzindo desperdícios, melhorando o planejamento das compras e ajudando famílias a economizar tempo e dinheiro.

---

# Requisitos do Sistema (Next.js Fullstack)

## Requisitos Funcionais

### RF01 – Autenticação
- O sistema deve permitir cadastro de usuário.
- O sistema deve permitir login com email e senha.
- O sistema deve permitir logout.
- O sistema deve manter sessão autenticada de forma segura.
- O sistema deve permitir recuperação de senha.

### RF02 – Gestão de Família (Household)
- O usuário deve poder criar uma família.
- O usuário deve poder convidar membros para a família.
- O sistema deve permitir múltiplos usuários por família.
- O sistema deve permitir definição de permissões (admin/membro).

### RF03 – Gestão de Itens
- O usuário deve poder cadastrar itens na despensa.
- O usuário deve poder editar itens.
- O usuário deve poder excluir itens.
- O usuário deve definir unidade de medida.
- O usuário deve definir quantidade mínima.
- O usuário deve registrar data de validade.
- O sistema deve armazenar histórico de alterações.

### RF04 – Controle de Estoque
- O sistema deve permitir atualizar quantidade manualmente.
- O sistema deve identificar automaticamente itens abaixo do limite mínimo.
- O sistema deve exibir alertas visuais de estoque baixo.
- O sistema deve permitir filtro por categoria.

### RF05 – Lista de Compras
- O sistema deve gerar lista automática com base em:
  - Estoque baixo
  - Frequência de consumo
  - Sazonalidade
- O usuário deve poder adicionar itens manualmente.
- O usuário deve poder marcar item como comprado.
- O sistema deve atualizar estoque após confirmação de compra.

### RF06 – Sazonalidade
- O sistema deve armazenar dados de sazonalidade por região.
- O sistema deve exibir produtos da estação.
- O sistema deve sugerir substituições econômicas.

### RF07 – Histórico e Consumo
- O sistema deve armazenar histórico de compras.
- O sistema deve calcular frequência média de consumo.
- O sistema deve permitir visualização de histórico por período.

### RF08 – Interface
- O sistema deve ser responsivo.
- O sistema deve funcionar em desktop e mobile.
- O sistema deve ter dashboard inicial com visão geral.

### RF09 – API (Next.js Backend)
- O sistema deve expor rotas seguras via Route Handlers.
- As rotas devem validar autenticação.
- As rotas devem validar dados de entrada.
- O sistema deve utilizar métodos HTTP adequados (GET, POST, PUT, DELETE).

---

## ⚙️ Requisitos Não Funcionais

### RNF01 – Arquitetura
- O sistema deve ser desenvolvido em Next.js (App Router).
- Frontend e backend devem estar no mesmo projeto.
- Deve seguir arquitetura modular e organizada por domínio.
- Deve separar camada de UI, lógica e acesso a dados.

### RNF02 – Segurança
- Senhas devem ser armazenadas com hash seguro.
- Rotas protegidas devem exigir autenticação.
- Deve haver proteção contra CSRF e XSS.
- Deve haver validação server-side obrigatória.
- Dados sensíveis não devem ser expostos no client.

### RNF03 – Performance
- Tempo de carregamento inicial inferior a 3 segundos.
- Utilização de Server Components quando possível.
- Uso de cache quando aplicável.
- Queries otimizadas no banco de dados.

### RNF04 – Escalabilidade
- Estrutura preparada para múltiplas famílias.
- Banco relacional escalável (ex: PostgreSQL).
- Código preparado para futura separação em microserviços.
- Possibilidade de futura transformação em SaaS.

### RNF05 – Usabilidade
- Interface intuitiva.
- Feedback visual para ações do usuário.
- Mensagens claras de erro.
- Fluxo simples para adicionar e atualizar itens.

### RNF06 – Manutenibilidade
- Código tipado (TypeScript).
- Padrão de organização consistente.
- Comentários em regras de negócio complexas.
- Testes unitários para regras críticas.

### RNF07 – Confiabilidade
- Persistência segura dos dados.
- Tratamento de erros no backend.
- Logs estruturados.
- Backup periódico do banco de dados.

### RNF08 – Disponibilidade
- Deploy em ambiente cloud confiável (ex: Vercel, AWS).
- Monitoramento de uptime.
- Estratégia de rollback em caso de falha.
  
---

# Licença

MIT
