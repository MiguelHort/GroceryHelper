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

# 🏗 Modelo de Domínio (Visão Geral)

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

# 📊 Requisitos Não Funcionais

- Interface responsiva (mobile-first)
- Experiência simples e intuitiva
- Autenticação segura
- Estrutura escalável
- Performance otimizada
- Proteção de dados

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

# Licença

MIT
