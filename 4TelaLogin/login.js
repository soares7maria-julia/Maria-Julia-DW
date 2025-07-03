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

  if (email && senha) {
    fetch('http://localhost:3000/login', {

      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    })
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        alert(data.erro);
      } else {
        // Redireciona com base no tipo
        if (data.usuario.tipo === "colaborador") {
  window.location.href = "../TelaAdicionarFilmes/adicionar.html";
} else if (data.usuario.tipo === "chefe") {
  window.location.href = "../TelaChefe/painel.html"; // ou qualquer nome da tela do chefe
} else {
  window.location.href = "../TelaInicial/Tela1.html";
}

      }
    })
    .catch(err => {
      console.error("Erro ao tentar login:", err);
      alert("Erro ao tentar login. Tente novamente mais tarde.");
    });
  }
});

// Botão de cadastro
btnCadastrar.addEventListener("click", () => {
  window.location.href = "../5Cadastro/cadastro.html";
});
