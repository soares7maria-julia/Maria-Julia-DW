const loginForm = document.getElementById("loginForm");
    const btnCadastrar = document.getElementById("btnCadastrar");
    const senhaInput = document.getElementById("senha");
    const togglePassword = document.getElementById("togglePassword");

    // Funcionalidade de mostrar/esconder senha
    togglePassword.addEventListener("click", function() {
      const type = senhaInput.getAttribute("type") === "password" ? "text" : "password";
      senhaInput.setAttribute("type", type);
      
      // Alterna o ícone
      this.textContent = type === "password" ? "👁" : "🙈";
    });

    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const senha = loginForm.senha.value.trim();

      if (email && senha) {
        // Aqui você pode implementar o que acontece ao entrar, por exemplo:
        alert(`Tentando login com:\nEmail: ${email}\nSenha: ${senha}`);
      }
    });

    btnCadastrar.addEventListener("click", () => {
      // Redireciona para a página de cadastro
      window.location.href = "../5Cadastro/cadastro.html";
    });

