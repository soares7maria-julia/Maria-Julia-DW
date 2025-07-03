// Carregar lista de usuários
fetch('http://localhost:3000/usuarios')
  .then(res => res.json())
  .then(usuarios => {
    const tbody = document.querySelector('#tabelaUsuarios tbody');
    usuarios.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nome}</td>
        <td>${usuario.email}</td>
        <td>${usuario.tipo}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => {
    alert("Erro ao carregar usuários");
    console.error(err);
  });

// Enviar novo colaborador
const form = document.getElementById('formColaborador');
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const senha = form.senha.value.trim();

  if (nome && email && senha) {
    fetch('http://localhost:3000/cadastrar-colaborador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert("Erro: " + data.erro);
      } else {
        alert("Colaborador cadastrado com sucesso!");
        location.reload(); // recarrega a tabela
      }
    })
    .catch(err => {
      alert("Erro ao cadastrar colaborador.");
      console.error(err);
    });
  }
});
