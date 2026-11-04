const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PRODUTOS_FILE = path.join(DATA_DIR, 'produtos.json');
const FORNECEDORES_FILE = path.join(DATA_DIR, 'fornecedores.json');

function garantirArquivos() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUTOS_FILE)) {
        fs.writeFileSync(PRODUTOS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(FORNECEDORES_FILE)) {
        fs.writeFileSync(FORNECEDORES_FILE, JSON.stringify([], null, 2));
    }
}

function lerDados(filePath) {
    garantirArquivos();
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function salvarDados(filePath, data) {
    garantirArquivos();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}


function servirEstatico(req, res) {
    let urlCaminho = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(__dirname, 'public', urlCaminho);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ erro: 'Rota ou recurso não encontrado.' }));
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const urlParts = req.url.split('?')[0].split('/'); 
  

    if (urlParts[1] === 'api') {
        const recurso = urlParts[2]; 
        const id = urlParts[3] ? parseInt(urlParts[3]) : null;

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', () => {
            let dadosReq = null;
            if (body) {
                try {
                    dadosReq = JSON.parse(body);
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'JSON inválido no corpo da requisição.' }));
                    return;
                }
            }

            if (recurso === 'fornecedores') {
                let fornecedores = lerDados(FORNECEDORES_FILE);

                if (req.method === 'GET' && !id) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fornecedores));
                }
                else if (req.method === 'GET' && id) {
                    const fornecedor = fornecedores.find(f => f.id === id);
                    if (!fornecedor) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Fornecedor não encontrado.' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(fornecedor));
                    }
                }
                else if (req.method === 'POST' && !id) {
                    const { razaoSocial, nomeFantasia, cnpj, telefone, email, endereco } = dadosReq || {};
                    if (!razaoSocial || !cnpj || !telefone || !email) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Preencha todos os campos obrigatórios do fornecedor.' }));
                        return;
                    }
                    if (fornecedores.some(f => f.cnpj === cnpj)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Já existe um fornecedor cadastrado com este CNPJ.' }));
                        return;
                    }

                    const novoFornecedor = {
                        id: fornecedores.length > 0 ? Math.max(...fornecedores.map(f => f.id)) + 1 : 1,
                        razaoSocial,
                        nomeFantasia: nomeFantasia || razaoSocial,
                        cnpj,
                        telefone,
                        email,
                        endereco: endereco || ''
                    };

                    fornecedores.push(novoFornecedor);
                    salvarDados(FORNECEDORES_FILE, fornecedores);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(novoFornecedor));
                }
                else if (req.method === 'PUT' && id) {
                    const index = fornecedores.findIndex(f => f.id === id);
                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Fornecedor não encontrado.' }));
                        return;
                    }
                    const { razaoSocial, nomeFantasia, cnpj, telefone, email, endereco } = dadosReq || {};
                    if (!razaoSocial || !cnpj || !telefone || !email) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Preencha todos os campos obrigatórios.' }));
                        return;
                    }
                    if (fornecedores.some(f => f.cnpj === cnpj && f.id !== id)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Outro fornecedor já utiliza este CNPJ.' }));
                        return;
                    }

                    fornecedores[index] = { id, razaoSocial, nomeFantasia, cnpj, telefone, email, endereco };
                    salvarDados(FORNECEDORES_FILE, fornecedores);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(fornecedores[index]));
                }
                else if (req.method === 'DELETE' && id) {
                    const index = fornecedores.findIndex(f => f.id === id);
                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Fornecedor não encontrado.' }));
                        return;
                    }

                    const produtos = lerDados(PRODUTOS_FILE);
                    if (produtos.some(p => p.fornecedorId === id)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Não é permitido excluir fornecedores que possuem produtos vinculados.' }));
                        return;
                    }

                    const removido = fornecedores.splice(index, 1)[0];
                    salvarDados(FORNECEDORES_FILE, fornecedores);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ mensagem: 'Fornecedor excluído com sucesso', fornecedor: removido }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Endpoint de fornecedores não encontrado.' }));
                }
            }

            else if (recurso === 'produtos') {
                let produtos = lerDados(PRODUTOS_FILE);

                if (req.method === 'GET' && !id) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(produtos));
                }
                else if (req.method === 'GET' && id) {
                    const produto = produtos.find(p => p.id === id);
                    if (!produto) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Produto não encontrado.' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(produto));
                    }
                }
                else if (req.method === 'POST' && !id) {
                    const { nome, codigo, categoria, descricao, precoUnitario, quantidadeEstoque, fornecedorId } = dadosReq || {};

                    if (!nome || !codigo || !categoria || precoUnitario === undefined || quantidadeEstoque === undefined || !fornecedorId) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Todos os campos do produto são obrigatórios.' }));
                        return;
                    }
                    if (Number(precoUnitario) < 0 || Number(quantidadeEstoque) < 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Preço e quantidade em estoque não podem ser negativos.' }));
                        return;
                    }
                    if (produtos.some(p => p.codigo === codigo)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Já existe um produto cadastrado com este código.' }));
                        return;
                    }

                    const novoProduto = {
                        id: produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1,
                        nome,
                        codigo,
                        categoria,
                        descricao: descricao || '',
                        precoUnitario: Number(precoUnitario),
                        quantidadeEstoque: Number(quantidadeEstoque),
                        fornecedorId: Number(fornecedorId)
                    };

                    produtos.push(novoProduto);
                    salvarDados(PRODUTOS_FILE, produtos);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(novoProduto));
                }
                else if (req.method === 'PUT' && id) {
                    const index = produtos.findIndex(p => p.id === id);
                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Produto não encontrado.' }));
                        return;
                    }
                    const { nome, codigo, categoria, descricao, precoUnitario, quantidadeEstoque, fornecedorId } = dadosReq || {};

                    if (!nome || !codigo || !categoria || precoUnitario === undefined || quantidadeEstoque === undefined || !fornecedorId) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Preencha todos os campos obrigatórios.' }));
                        return;
                    }
                    if (Number(precoUnitario) < 0 || Number(quantidadeEstoque) < 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Preço e quantidade não podem ser negativos.' }));
                        return;
                    }
                    if (produtos.some(p => p.codigo === codigo && p.id !== id)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Outro produto já utiliza este código.' }));
                        return;
                    }

                    produtos[index] = {
                        id,
                        nome,
                        codigo,
                        categoria,
                        descricao: descricao || '',
                        precoUnitario: Number(precoUnitario),
                        quantidadeEstoque: Number(quantidadeEstoque),
                        fornecedorId: Number(fornecedorId)
                    };

                    salvarDados(PRODUTOS_FILE, produtos);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(produtos[index]));
                }
                else if (req.method === 'DELETE' && id) {
                    const index = produtos.findIndex(p => p.id === id);
                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ erro: 'Produto não encontrado.' }));
                        return;
                    }

                    const removido = produtos.splice(index, 1)[0];
                    salvarDados(PRODUTOS_FILE, produtos);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ mensagem: 'Produto excluído com sucesso', produto: removido }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Endpoint de produtos não encontrado.' }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Recurso da API não encontrado.' }));
            }
        });
    } else {
        servirEstatico(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Servidor de Controle de Estoque rodando em http://localhost:${PORT}`);
});