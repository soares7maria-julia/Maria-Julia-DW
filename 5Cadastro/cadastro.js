const cadastroForm = document.getElementById('cadastroForm');
    const btnLogin = document.getElementById('btnLogin');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordError = document.getElementById('passwordError');

    // Funcionalidade de mostrar/esconder senha
    togglePassword.addEventListener('click', function() {
      const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
      senhaInput.setAttribute('type', type);
      
      // Alterna o ícone
      this.textContent = type === 'password' ? '👁' : '🙈';
    });

    // Funcionalidade de mostrar/esconder confirmar senha
    toggleConfirmPassword.addEventListener('click', function() {
      const type = confirmarSenhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmarSenhaInput.setAttribute('type', type);
      
      // Alterna o ícone
      this.textContent = type === 'password' ? '👁' : '🙈';
    });

    // Validação de senhas iguais
    function validatePasswords() {
      const senha = senhaInput.value;
      const confirmarSenha = confirmarSenhaInput.value;
      
      if (confirmarSenha && senha !== confirmarSenha) {
        passwordError.style.display = 'block';
        return false;
      } else {
        passwordError.style.display = 'none';
        return true;
      }
    }

    // Validação em tempo real
    confirmarSenhaInput.addEventListener('input', validatePasswords);
    senhaInput.addEventListener('input', validatePasswords);

    cadastroForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validatePasswords()) {
        return;
      }

      const nome = cadastroForm.nome.value.trim();
      const email = cadastroForm.email.value.trim();
      const senha = cadastroForm.senha.value.trim();

     if (nome && email && senha) {
  fetch('http://localhost:3000/cadastrar', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.erro) {
      alert("Erro: " + data.erro);
    } else {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "../4TelaLogin/login.html"; // redireciona pro login
    }
  })
  .catch(err => {
    console.error("Erro ao cadastrar:", err);
    alert("Erro ao cadastrar. Tente novamente mais tarde.");
  });
}
    });
    btnLogin.addEventListener("click", () => {
      // Redireciona para a página de login
     window.location.href = "../4TelaLogin/login.html";
    });