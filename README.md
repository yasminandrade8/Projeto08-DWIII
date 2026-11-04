# 📦 Projeto 08 - Sistema de Controle de Estoque (CRUD + API REST + BrasilAPI)
> **Disciplina:** Desenvolvimento Web III
> **Linguagem:** HTML5, JSON, CSS3 e JavaScript (Node.js) 

Aplicação web completa desenvolvida para o gerenciamento de stock de uma empresa comercial, permitindo controlar produtos, quantidades disponíveis, preços, fornecedores, além de contar com indicadores automáticos de stock baixo e integração oficial com a **BrasilAPI**.

O projeto foi construído utilizando **Node.js nativo (sem frameworks)** no back-end, complementado por uma interface web moderna em HTML5, CSS3 e JavaScript puro no front-end.

---

## 🚀 Funcionalidades Principais

* **Gestão de Produtos (CRUD Completo):** Cadastre, liste, consulte, edite e elimine produtos vinculados a fornecedores.
* **Gestão de Fornecedores (CRUD Completo):** Registo empresarial com validação estricta para impedir CNPJs duplicados.
* **Regra de Negócio de Vínculo:** O sistema impede automaticamente a eliminação de fornecedores que possuam produtos ativos associados.
* **Integração com a BrasilAPI:** Consulta automática de dados empresariais por CNPJ, preenchendo os campos do formulário instantaneamente.
* **Indicadores de Stock em Tempo Real:** 
  * Cálculo automatizado do **Valor Total do Stock** ($\sum \text{Preço} \times \text{Quantidade}$).
  * Identificação visual e destaque em tabela para produtos com **menos de 5 unidades** (stock baixo).
* **API RESTful Completa:** Endpoints dedicados para produtos e fornecedores estruturados em JSON, seguindo os códigos de status HTTP corretos.
* **Persistência de Dados:** Armazenamento seguro em ficheiros JSON (`data/produtos.json` e `data/fornecedores.json`), mantendo as informações mesmo após reiniciar o servidor.
* **Tratamento Robusto de Erros:** Validação contra preços/quantidades negativos, campos obrigatórios em falta, códigos duplicados e rotas inexistentes.

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:** Node.js (Módulos nativos: `http`, `fs`, `path`)
* **Front-end:** HTML5, CSS3, JavaScript (Fetch API, DOM)
* **Base de Dados Local:** Ficheiros JSON (`data/`)
* **API Externa:** [BrasilAPI (Módulo CNPJ)](https://brasilapi.com.br/docs)

---

## 📂 Estrutura do Projeto

```text
controle-estoque/
│
├── data/
│   ├── fornecedores.json   # Base de dados de fornecedores
│   └── produtos.json       # Base de dados de produtos e stock
├── public/
│   ├── index.html          # Interface web principal com navegação por abas
│   ├── style.css           # Estilização responsiva e alertas visuais
│   └── script.js           # Lógica do front-end, fetch e cálculos
├── server.js               # Servidor HTTP Node.js e API REST
├── package.json            # Configurações do projeto Node.js
└── README.md               # Documentação oficial do projeto
```

---

## ⚙️ Como Executar o Projeto

Certifica-te de que tens o **Node.js** instalado no teu computador.

1. Abre a pasta do projeto no teu terminal.
2. Inicia o servidor Node.js:
   ```bash
   node server.js
   ```
3. Abre o teu browser e acede a:
   ```text
   http://localhost:3000
   ```

---

## 🔌 Documentação da API REST

### Produtos
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/produtos` | Lista todos os produtos do stock |
| `GET` | `/api/produtos/:id` | Consulta os detalhes de um produto específico |
| `POST` | `/api/produtos` | Cadastra um novo produto |
| `PUT` | `/api/produtos/:id` | Atualiza um produto existente |
| `DELETE` | `/api/produtos/:id` | Elimina um produto do stock |

### Fornecedores
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/fornecedores` | Lista todos os fornecedores |
| `GET` | `/api/fornecedores/:id` | Consulta um fornecedor específico |
| `POST` | `/api/fornecedores` | Cadastra um novo fornecedor |
| `PUT` | `/api/fornecedores/:id` | Atualiza um fornecedor existente |
| `DELETE` | `/api/fornecedores/:id` | Elimina um fornecedor (bloqueado se houver produtos vinculados) |

---

## 👩‍💻 Autora
Feito com 💜 por Yasmin Andrade