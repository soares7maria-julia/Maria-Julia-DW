const loginForm = document.getElementById("loginForm");
const btnCadastrar = document.getElementById("btnCadastrar");
const senhaInput = document.getElementById("senha");
const togglePassword = document.getElementById("togglePassword");

// Mostrar/esconder senha
togglePassword.addEventListener("click", function () {
  const type = senhaInput.getAttribute("type") === "password" ? "text" : "password";
  senhaInput.setAttribute("type", type);
  this.textContent = type === "password" ? "👁" : "🙈";
});

// Enviar login
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = loginForm.email.value.trim();
  const senha = loginForm.senha.value.trim();
  
  if (!email) {
  alert("Por favor, insira o email.");
  return;
}
if (!senha) {
  alert("Por favor, insira a senha.");
  return;
}


  if (email && senha) {
    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
  document.cookie = `usuarioLogado=${encodeURIComponent(JSON.stringify(data.usuario))}; path=/; max-age=3600`;

  // Sempre redireciona para a tela principal
  window.location.href = '../1TelaInicial/tela1.html';
     } else {
        alert(data.erro || 'Erro desconhecido');
      }
    })
    .catch(err => {
      console.error("Erro ao tentar login:", err);
      alert("Erro ao tentar login. Tente novamente mais tarde.");
    });
  }
});

btnCadastrar.addEventListener("click", function () {
  window.location.href = "../5Cadastro/cadastro.html"; // ajuste o caminho se necessário
});
