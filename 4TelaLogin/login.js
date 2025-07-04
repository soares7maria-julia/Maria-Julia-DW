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
        localStorage.setItem("usuarioNome", data.usuario.nome);

       // Redireciona todo mundo para a tela inicial:
window.location.href = "../1TelaInicial/Tela1.html";


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
