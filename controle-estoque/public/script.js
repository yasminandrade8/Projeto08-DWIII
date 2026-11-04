const API_PRODUTOS = '/api/produtos';
const API_FORNECEDORES = '/api/fornecedores';

let produtosCache = [];
let fornecedoresCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosIniciais();

    document.getElementById('formProduto').addEventListener('submit', salvarProduto);
    document.getElementById('inputPesquisaProduto').addEventListener('input', filtrarProdutos);
    document.getElementById('selectFiltroCategoria').addEventListener('change', filtrarProdutos);
    document.getElementById('formFornecedor').addEventListener('submit', salvarFornecedor);
});

function mostrarMensagem(texto, tipo = 'sucesso') {
    const el = document.getElementById('mensagem');
    el.textContent = texto;
    el.className = `mensagem ${tipo}`;
    setTimeout(() => { el.className = 'mensagem hidden'; }, 4000);
}

function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    if (aba === 'produtos') {
        document.getElementById('aba-produtos').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (aba === 'fornecedores') {
        document.getElementById('aba-fornecedores').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (aba === 'brasilapi') {
        document.getElementById('aba-brasilapi').classList.remove('hidden');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
    }
}

async function carregarDadosIniciais() {
    await carregarFornecedores();
    await carregarProdutos();
}

async function carregarFornecedores() {
    try {
        const res = await fetch(API_FORNECEDORES);
        if (!res.ok) throw new Error('Erro ao carregar fornecedores.');
        fornecedoresCache = await res.json();
        
        renderizarSelectFornecedores();
        renderizarTabelaFornecedores(fornecedoresCache);
    } catch (e) {
        mostrarMensagem('Erro ao carregar lista de fornecedores.', 'erro');
    }
}

function renderizarSelectFornecedores() {
    const select = document.getElementById('prodFornecedor');
    select.innerHTML = '<option value="">Selecione um fornecedor...</option>';
    fornecedoresCache.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.razaoSocial} (CNPJ: ${f.cnpj})`;
        select.appendChild(opt);
    });
}

function renderizarTabelaFornecedores(fornecedores) {
    const tbody = document.getElementById('tabelaFornecedores');
    tbody.innerHTML = '';

    if (fornecedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum fornecedor cadastrado.</td></tr>';
        return;
    }

    fornecedores.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${f.cnpj}</td>
            <td><strong>${f.razaoSocial}</strong></td>
            <td>${f.nomeFantasia || '-'}</td>
            <td>${f.telefone}</td>
            <td>${f.email}</td>
            <td>
                <button class="btn-warning" onclick="prepararEdicaoFornecedor(${f.id})">Editar</button>
                <button class="btn-danger" onclick="excluirFornecedor(${f.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function salvarFornecedor(e) {
    e.preventDefault();
    const id = document.getElementById('fornId').value;
    const cnpj = document.getElementById('fornCnpj').value;
    const razaoSocial = document.getElementById('fornRazao').value;
    const nomeFantasia = document.getElementById('fornFantasia').value;
    const telefone = document.getElementById('fornTelefone').value;
    const email = document.getElementById('fornEmail').value;
    const endereco = document.getElementById('fornEndereco').value;

    const data = { cnpj, razaoSocial, nomeFantasia, telefone, email, endereco };

    try {
        const url = id ? `${API_FORNECEDORES}/${id}` : API_FORNECEDORES;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || 'Erro ao salvar fornecedor.');

        mostrarMensagem(id ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
        cancelarEdicaoFornecedor();
        carregarFornecedores();
    } catch (err) {
        mostrarMensagem(err.message, 'erro');
    }
}

window.prepararEdicaoFornecedor = function(id) {
    const f = fornecedoresCache.find(x => x.id === id);
    if (!f) return;

    document.getElementById('fornId').value = f.id;
    document.getElementById('fornCnpj').value = f.cnpj;
    document.getElementById('fornRazao').value = f.razaoSocial;
    document.getElementById('fornFantasia').value = f.nomeFantasia || '';
    document.getElementById('fornTelefone').value = f.telefone;
    document.getElementById('fornEmail').value = f.email;
    document.getElementById('fornEndereco').value = f.endereco || '';

    document.getElementById('formFornecedorTitulo').textContent = 'Editar Fornecedor';
    document.getElementById('btnSalvarFornecedor').textContent = 'Salvar Alterações';
    document.getElementById('btnCancelarFornecedor').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function cancelarEdicaoFornecedor() {
    document.getElementById('formFornecedor').reset();
    document.getElementById('fornId').value = '';
    document.getElementById('formFornecedorTitulo').textContent = 'Cadastrar Novo Fornecedor';
    document.getElementById('btnSalvarFornecedor').textContent = 'Cadastrar Fornecedor';
    document.getElementById('btnCancelarFornecedor').classList.add('hidden');
}

async function excluirFornecedor(id) {
    if (!confirm('Tem certeza de que deseja excluir este fornecedor?')) return;

    try {
        const res = await fetch(`${API_FORNECEDORES}/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || 'Erro ao excluir fornecedor.');

        mostrarMensagem('Fornecedor excluído com sucesso!');
        carregarFornecedores();
    } catch (err) {
        mostrarMensagem(err.message, 'erro');
    }
}

// ==================== PRODUTOS ====================
async function carregarProdutos() {
    try {
        const res = await fetch(API_PRODUTOS);
        if (!res.ok) throw new Error('Erro ao carregar produtos.');
        produtosCache = await res.json();

        atualizarCategoriasSelect();
        renderizarProdutos(produtosCache);
        calcularEstatisticasEstoque(produtosCache);
    } catch (e) {
        mostrarMensagem('Erro ao carregar produtos.', 'erro');
    }
}

function atualizarCategoriasSelect() {
    const select = document.getElementById('selectFiltroCategoria');
    const categorias = [...new Set(produtosCache.map(p => p.categoria))];
    
    select.innerHTML = '<option value="">Todas as Categorias</option>';
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function calcularEstatisticasEstoque(produtos) {
    let valorTotal = 0;
    let qtdEstoqueBaixo = 0;

    produtos.forEach(p => {
        valorTotal += (Number(p.precoUnitario) || 0) * (Number(p.quantidadeEstoque) || 0);
        if (Number(p.quantidadeEstoque) < 5) {
            qtdEstoqueBaixo++;
        }
    });

    document.getElementById('valorTotalEstoque').textContent = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('totalEstoqueBaixo').textContent = qtdEstoqueBaixo;
}

function renderizarProdutos(produtos) {
    const tbody = document.getElementById('tabelaProdutos');
    tbody.innerHTML = '';

    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum produto cadastrado no estoque.</td></tr>';
        return;
    }

    produtos.forEach(p => {
        const fornecedor = fornecedoresCache.find(f => f.id === p.fornecedorId);
        const nomeFornecedor = fornecedor ? fornecedor.razaoSocial : 'Desconhecido';
        const subtotal = p.precoUnitario * p.quantidadeEstoque;
        const estoqueBaixo = p.quantidadeEstoque < 5;

        const tr = document.createElement('tr');
        if (estoqueBaixo) tr.className = 'estoque-baixo';

        tr.innerHTML = `
            <td>${p.codigo}</td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.categoria}</td>
            <td>R$ ${Number(p.precoUnitario).toFixed(2)}</td>
            <td>
                ${p.quantidadeEstoque} 
                ${estoqueBaixo ? '<span class="badge-alerta" title="Estoque Baixo!">&lt; 5</span>' : ''}
            </td>
            <td><strong>R$ ${subtotal.toFixed(2)}</strong></td>
            <td>${nomeFornecedor}</td>
            <td>
                <button class="btn-warning" onclick="prepararEdicaoProduto(${p.id})">Editar</button>
                <button class="btn-danger" onclick="excluirProduto(${p.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function salvarProduto(e) {
    e.preventDefault();
    const id = document.getElementById('produtoId').value;
    const nome = document.getElementById('prodNome').value;
    const codigo = document.getElementById('prodCodigo').value;
    const categoria = document.getElementById('prodCategoria').value;
    const fornecedorId = document.getElementById('prodFornecedor').value;
    const precoUnitario = document.getElementById('prodPreco').value;
    const quantidadeEstoque = document.getElementById('prodQtd').value;
    const descricao = document.getElementById('prodDescricao').value;

    const data = { nome, codigo, categoria, fornecedorId, precoUnitario, quantidadeEstoque, descricao };

    try {
        const url = id ? `${API_PRODUTOS}/${id}` : API_PRODUTOS;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || 'Erro ao salvar produto.');

        mostrarMensagem(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        cancelarEdicaoProduto();
        carregarProdutos();
    } catch (err) {
        mostrarMensagem(err.message, 'erro');
    }
}

window.prepararEdicaoProduto = function(id) {
    const p = produtosCache.find(x => x.id === id);
    if (!p) return;

    document.getElementById('produtoId').value = p.id;
    document.getElementById('prodNome').value = p.nome;
    document.getElementById('prodCodigo').value = p.codigo;
    document.getElementById('prodCategoria').value = p.categoria;
    document.getElementById('prodFornecedor').value = p.fornecedorId;
    document.getElementById('prodPreco').value = p.precoUnitario;
    document.getElementById('prodQtd').value = p.quantidadeEstoque;
    document.getElementById('prodDescricao').value = p.descricao || '';

    document.getElementById('formProdutoTitulo').textContent = 'Editar Produto';
    document.getElementById('btnSalvarProduto').textContent = 'Salvar Alterações';
    document.getElementById('btnCancelarProduto').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function cancelarEdicaoProduto() {
    document.getElementById('formProduto').reset();
    document.getElementById('produtoId').value = '';
    document.getElementById('formProdutoTitulo').textContent = 'Cadastrar Novo Produto';
    document.getElementById('btnSalvarProduto').textContent = 'Cadastrar Produto';
    document.getElementById('btnCancelarProduto').classList.add('hidden');
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza de que deseja excluir este produto do estoque?')) return;

    try {
        const res = await fetch(`${API_PRODUTOS}/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro || 'Erro ao excluir produto.');

        mostrarMensagem('Produto excluído com sucesso!');
        carregarProdutos();
    } catch (err) {
        mostrarMensagem(err.message, 'erro');
    }
}

function filtrarProdutos() {
    const termo = document.getElementById('inputPesquisaProduto').value.toLowerCase();
    const catFiltro = document.getElementById('selectFiltroCategoria').value;

    const filtrados = produtosCache.filter(p => {
        const matchNome = p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo);
        const matchCat = catFiltro === '' || p.categoria === catFiltro;
        return matchNome && matchCat;
    });

    renderizarProdutos(filtrados);
}

async function consultarBrasilAPI() {
    let cnpj = document.getElementById('inputCnpjBusca').value.trim().replace(/\D/g, '');
    const resultadoDiv = document.getElementById('resultadoBrasilApi');

    if (cnpj.length !== 14) {
        mostrarMensagem('CNPJ inválido. Digite 14 dígitos numéricos.', 'erro');
        return;
    }

    resultadoDiv.innerHTML = '<p>Consultando BrasilAPI...</p>';
    resultadoDiv.classList.remove('hidden');

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!res.ok) throw new Error('CNPJ não encontrado ou indisponível na BrasilAPI.');

        const data = await res.json();
        
        const razao = data.razao_social || '';
        const fantasia = data.nome_fantasia || razao;
        const situacao = data.descricao_situacao_cadastral || 'Ativa';
        const logradouro = data.logradouro || '';
        const numero = data.numero || '';
        const bairro = data.bairro || '';
        const municipio = data.municipio || '';
        const uf = data.uf || '';
        const enderecoCompleto = `${logradouro}, ${numero} - ${bairro}, ${municipio}/${uf}`;
        const telefone = data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0,2)}) ${data.ddd_telefone_1.slice(2)}` : '';
        const email = data.email || '';

        resultadoDiv.innerHTML = `
            <h4>${razao} (${fantasia})</h4>
            <p><strong>CNPJ:</strong> ${data.cnpj}</p>
            <p><strong>Situação Cadastral:</strong> ${situacao}</p>
            <p><strong>Município/UF:</strong> ${municipio} - ${uf}</p>
            <p><strong>Endereço:</strong> ${enderecoCompleto}</p>
            <button type="button" class="btn-primary" style="margin-top: 1rem;" 
                onclick='preencherFornecedorDaApi(${JSON.stringify({
                    cnpj: data.cnpj,
                    razaoSocial: razao,
                    nomeFantasia: fantasia,
                    telefone,
                    email,
                    endereco: enderecoCompleto
                })})'>
                Preencher Formulário de Fornecedor
            </button>
        `;
    } catch (err) {
        resultadoDiv.innerHTML = `<p style="color: red;">${err.message}. O cadastro manual permanece disponível.</p>`;
    }
}

window.preencherFornecedorDaApi = function(dados) {
    mudarAba('fornecedores');
    document.getElementById('fornCnpj').value = dados.cnpj;
    document.getElementById('fornRazao').value = dados.razaoSocial;
    document.getElementById('fornFantasia').value = dados.nomeFantasia;
    document.getElementById('fornTelefone').value = dados.telefone;
    document.getElementById('fornEmail').value = dados.email;
    document.getElementById('fornEndereco').value = dados.endereco;
    mostrarMensagem('Dados carregados da BrasilAPI no formulário de fornecedor com sucesso!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};