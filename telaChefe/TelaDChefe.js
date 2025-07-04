

const form = document.getElementById('formColaborador');
const btnSalvar = document.querySelector('#formColaborador button[type="submit"]');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const tipoSelect = document.getElementById('tipo');

let editandoId = null; // 🟡 ID do usuário que está sendo editado (se houver)

// 🟢 Enviar novo colaborador ou editar existente
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const tipo = tipoSelect.value;

  if (!nome || !email || !senha || !tipo) {
    alert("Preencha todos os campos!");
    return;
  }

  if (editandoId) {
    // Atualizar usuário existente (somente nome e tipo)
    fetch(`http://localhost:3000/editar-colaborador/${editandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, tipo })
    })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert("Erro: " + data.erro);
      } else {
        alert("Usuário atualizado com sucesso!");
        location.reload();
        editandoId = null;
emailInput.readOnly = false;
senhaInput.readOnly = false;
btnSalvar.textContent = "Cadastrar";
form.reset();

      }
    })
    .catch(err => {
      alert("Erro ao atualizar usuário.");
      console.error(err);
    });
  } else {
    // Cadastrar novo usuário
    fetch('http://localhost:3000/cadastrar-colaborador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, tipo })
    })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert("Erro: " + data.erro);
      } else {
        alert("Usuário cadastrado com sucesso!");
        location.reload();
      }
    })
    .catch(err => {
      alert("Erro ao cadastrar usuário.");
      console.error(err);
    });
  }
});

// 🟡 Carregar lista de usuários
fetch('http://localhost:3000/usuarios')
  .then(res => res.json())
  .then(usuarios => {
    const tbody = document.querySelector('#tabelaUsuarios tbody');
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
  <td>${usuario.id}</td>
  <td>${usuario.nome}</td>
  <td>${usuario.email}</td>
  <td>${usuario.tipo}</td>
  <td>
    <button class="btn-editar"
      data-id="${usuario.id}"
      data-nome="${usuario.nome}"
      data-email="${usuario.email}"
      data-senha="${usuario.senha || ''}"
      data-tipo="${usuario.tipo}">
      Editar
    </button>
    <button class="btn-excluir" data-id="${usuario.id}">Excluir</button>
  </td> `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => {
    alert("Erro ao carregar usuários");
    console.error(err);
  });


const toggleSenhaBtn = document.getElementById('toggleSenha');

toggleSenha.addEventListener('click', () => {
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
    toggleSenha.textContent = '🙈';
  } else {
    senhaInput.type = 'password';
    toggleSenha.textContent = '👁';
  }
});


// Delegação de eventos
document.querySelector('#tabelaUsuarios tbody').addEventListener('click', (e) => {
 if (e.target.classList.contains('btn-editar')) {
  const id = e.target.dataset.id;
  const nome = e.target.dataset.nome;
  const email = e.target.dataset.email;
  const senha = e.target.dataset.senha;
  const tipo = e.target.dataset.tipo;

  nomeInput.value = nome;
  emailInput.value = email;
  senhaInput.value = senha;
  tipoSelect.value = tipo;

  // Bloquear campos que não podem ser editados
  emailInput.readOnly = true;
  senhaInput.readOnly = true;

  // Salvar o ID que está sendo editado
  editandoId = id;
  btnSalvar.textContent = "Salvar alterações";
}

  if (e.target.classList.contains('btn-excluir')) {
    const id = e.target.dataset.id;
    excluirUsuario(id);
  }
});

function excluirUsuario(id) {
  if (confirm("Deseja realmente excluir este usuário?")) {
    fetch(`http://localhost:3000/excluir-colaborador/${id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert("Erro: " + data.erro);
      } else {
        alert("Usuário excluído!");
        location.reload();
      }
    })
    .catch(err => {
      alert("Erro ao excluir usuário.");
      console.error(err);
    });
  }
}
