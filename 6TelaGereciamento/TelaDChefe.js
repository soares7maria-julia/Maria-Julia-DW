document.addEventListener('DOMContentLoaded', () => {
  // URL base da sua API
  const API_URL = 'http://localhost:3000';

  // --- CONTROLE DAS ABAS ---
window.mostrarAba = (nomeAba, evento) => {
  document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('active'));
  document.querySelectorAll('.aba-link').forEach(link => link.classList.remove('active'));

  document.getElementById(`aba-${nomeAba}`).classList.add('active');
  if (evento) evento.currentTarget.classList.add('active');
};

  // --- CONTROLE DAS ABAS ---
  window.mostrarAba = (nomeAba ) => {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('active'));
    document.querySelectorAll('.aba-link').forEach(link => link.classList.remove('active'));

    document.getElementById(`aba-${nomeAba}`).classList.add('active');
    event.currentTarget.classList.add('active');
  };

  
  // --- GERENCIAMENTO DE USUÁRIOS ---
  const formUsuario = document.getElementById('formColaborador');
  const btnSalvarUsuario = document.getElementById('btnSalvarUsuario');
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const tipoSelect = document.getElementById('tipo');
  const tabelaUsuariosBody = document.querySelector('#tabelaUsuarios tbody');
  let editandoUsuarioId = null;

  // Carregar usuários
  function carregarUsuarios() {
    fetch(`${API_URL}/usuarios`)
      .then(res => res.json())
      .then(usuarios => {
        tabelaUsuariosBody.innerHTML = '';
        usuarios.forEach(usuario => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>${usuario.tipo}</td>
            <td>
              <button class="btn-editar" data-tipo-item="usuario" data-id="${usuario.id}">Editar</button>
              <button class="btn-excluir" data-tipo-item="usuario" data-id="${usuario.id}">Excluir</button>
            </td>`;
          tabelaUsuariosBody.appendChild(tr);
        });
      }).catch(err => console.error('Erro ao carregar usuários:', err));
  }

  // Salvar (adicionar/editar) usuário
  formUsuario.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = editandoUsuarioId 
      ? `${API_URL}/editar-colaborador/${editandoUsuarioId}` 
      : `${API_URL}/cadastrar-colaborador`;
    const method = editandoUsuarioId ? 'PUT' : 'POST';
    
    const body = {
      nome: nomeInput.value,
      email: emailInput.value,
      senha: senhaInput.value,
      tipo: tipoSelect.value
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
      if (data.erro) throw new Error(data.erro);
      alert(`Usuário ${editandoUsuarioId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      location.reload();
    }).catch(err => alert(`Erro: ${err.message}`));
  });

  // --- GERENCIAMENTO DE FILMES ---
  const formFilme = document.getElementById('formFilme');
  const btnSalvarFilme = document.getElementById('btnSalvarFilme');
  const tabelaFilmesBody = document.querySelector('#tabelaFilmes tbody');
  let editandoFilmeId = null;

  // Carregar filmes
  function carregarFilmes() {
    fetch(`${API_URL}/filmes`)
      .then(res => res.json())
      .then(filmes => {
        tabelaFilmesBody.innerHTML = '';
        filmes.forEach(filme => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><img src="${API_URL}${filme.capa}" alt="${filme.titulo}" class="capa-tabela"></td>
            <td>${filme.titulo}</td>
            <td>${filme.ano}</td>
            <td>${filme.genero}</td>
            <td>
              <button class="btn-editar" data-tipo-item="filme" data-id="${filme.id}">Editar</button>
              <button class="btn-excluir" data-tipo-item="filme" data-id="${filme.id}">Excluir</button>
            </td>`;
          tabelaFilmesBody.appendChild(tr);
        });
      }).catch(err => console.error('Erro ao carregar filmes:', err));
  }

  // Salvar (adicionar/editar) filme
  formFilme.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formFilme);

// Verifica se é edição ou adição
if (!editandoFilmeId) {
  const capa = document.getElementById('filme-capa').files[0];
  if (!capa) {
    alert('Por favor, selecione uma imagem de capa para o filme.');
    return;
  }
}

formData.append('dataAdicao', new Date().toISOString());

    const url = editandoFilmeId 
      ? `${API_URL}/editar-filme/${editandoFilmeId}` // Assumindo que você criará esta rota
      : `${API_URL}/adicionar-filme`;
    const method = editandoFilmeId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      body: formData // FormData não precisa de 'Content-Type' header
    }).then(res => res.json()).then(data => {
      if (data.error || data.erro) throw new Error(data.error || data.erro);
      alert(`Filme ${editandoFilmeId ? 'atualizado' : 'adicionado'} com sucesso!`);
formFilme.reset();
btnSalvarFilme.textContent = 'Cadastrar Filme';
editandoFilmeId = null;
carregarFilmes(); // Atualiza a tabela de filmes sem recarregar a página

    }).catch(err => alert(`Erro: ${err.message}`));
  });

  // --- DELEGAÇÃO DE EVENTOS (para botões Editar/Excluir) ---
  document.body.addEventListener('click', (e) => {
    const target = e.target;
    const tipoItem = target.dataset.tipoItem;
    const id = target.dataset.id;

    if (target.classList.contains('btn-editar')) {
      if (tipoItem === 'usuario') handleEditarUsuario(id);
      if (tipoItem === 'filme') handleEditarFilme(id);
    }

    if (target.classList.contains('btn-excluir')) {
      if (tipoItem === 'usuario') handleExcluirUsuario(id);
      if (tipoItem === 'filme') handleExcluirFilme(id);
    }
  });

  // Funções de manipulação
  function handleEditarUsuario(id) {
    fetch(`${API_URL}/usuarios`) // Busca o usuário específico para popular o form
      .then(res => res.json())
      .then(usuarios => {
        const usuario = usuarios.find(u => u.id == id);
        if (!usuario) return;
        
        nomeInput.value = usuario.nome;
        emailInput.value = usuario.email;
        senhaInput.value = ''; // Senha não deve ser exibida
        senhaInput.placeholder = "Digite uma nova senha para alterar";
        tipoSelect.value = usuario.tipo;
        
        emailInput.readOnly = true; // Não permitir edição de email
        editandoUsuarioId = id;
        btnSalvarUsuario.textContent = 'Salvar Alterações';
        window.scrollTo(0, 0); // Rola para o topo
      });
  }

  function handleExcluirUsuario(id) {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    fetch(`${API_URL}/excluir-colaborador/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.erro) throw new Error(data.erro);
        alert('Usuário excluído com sucesso!');
        location.reload();
      }).catch(err => alert(`Erro: ${err.message}`));
  }

  function handleEditarFilme(id) {
    // Assumindo que /filmes/:id retorna um filme específico
    fetch(`${API_URL}/filmes`)
      .then(res => res.json())
      .then(filmes => {
        const filme = filmes.find(f => f.id == id);
        if (!filme) return;

    document.getElementById('filme-titulo').value = filme.titulo;
    document.getElementById('filme-genero').value = filme.genero;
    document.getElementById('filme-duracao').value = filme.duracao || '';
    document.getElementById('filme-ano').value = filme.ano || '';
    document.getElementById('filme-categoria').value = filme.categoria || '';
    document.getElementById('filme-link').value = filme.linkFilme || '';

        editandoFilmeId = id;
        btnSalvarFilme.textContent = 'Salvar Alterações';
        mostrarAba('filmes'); // Garante que a aba de filmes está visível
        window.scrollTo(0, 0);
      });
  }

  // Formatação automática da duração (igual à tela antiga)
const campoDuracao = document.getElementById('filme-duracao');

campoDuracao.addEventListener('input', function () {
  let valor = this.value.replace(/[^\d]/g, '');

  if (valor.length === 0) {
    this.value = '';
  } else if (valor.length === 1) {
    this.value = valor + 'h ';
  } else if (valor.length === 2 || valor.length === 3) {
    this.value = valor.charAt(0) + 'h ' + valor.substring(1) + 'm';
  } else if (valor.length > 3) {
    this.value = valor.charAt(0) + 'h ' + valor.substring(1, 3) + 'm';
  }
});


  function handleExcluirFilme(id) {
    if (!confirm('Deseja realmente excluir este filme?')) return;
    // Assumindo que você criará a rota DELETE /excluir-filme/:id
    fetch(`${API_URL}/excluir-filme/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.erro || data.error) throw new Error(data.erro || data.error);
        alert('Filme excluído com sucesso!');
        location.reload();
      }).catch(err => alert(`Erro: ${err.message}`));
  }

  // --- INICIALIZAÇÃO ---
  carregarUsuarios();
  carregarFilmes();
});



