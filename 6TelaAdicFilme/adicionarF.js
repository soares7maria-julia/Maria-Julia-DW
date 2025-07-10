
function lerCookie(nome) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nome}=`);
  if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
  return null;
}
const cookieBruto = lerCookie('usuarioLogado');
const usuario = cookieBruto ? JSON.parse(cookieBruto) : null;


function salvarCookie(nome, valor, horasValidade = 1) {
  const dataExpiracao = new Date();
  dataExpiracao.setTime(dataExpiracao.getTime() + (horasValidade * 60 * 60 * 1000));
  document.cookie = `${nome}=${encodeURIComponent(valor)}; path=/; expires=${dataExpiracao.toUTCString()}`;
}
const email = document.getElementById('email').value;
const senha = document.getElementById('senha').value;


fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
})
.then(res => res.json())
.then(data => {
  if (data.sucesso) {
    salvarCookie('usuarioLogado', JSON.stringify(data.usuario), 1); // 1 hora
    window.location.href = '../tela-restrita.html'; // ou página protegida
  } else {
    mostrarErro(data.erro);
  }
})


if (!usuario || (usuario.tipo === 'normal' )) {
  alert('Acesso negado. Apenas colaboradores e chefes podem adicionar filmes.');
  window.location.href = '../1TelaInicial/tela1.html'; // ou outra página de login/home
}

let filmesAdicionados = [];
const filmesCookie = lerCookie('filmesAdicionados');
if (filmesCookie) {
  try {
    filmesAdicionados = JSON.parse(filmesCookie);
  } catch {
    filmesAdicionados = [];
  }
}

document.getElementById('formFilme').addEventListener('submit', function(e) {
  e.preventDefault();

  const linkFilme = document.getElementById('linkFilme').value.trim();
  const titulo = document.getElementById('titulo').value.trim();
  const genero = document.getElementById('genero').value.trim();
  const duracao = document.getElementById('duracao').value.trim();
  const ano = parseInt(document.getElementById('ano').value);
  const categoria = document.getElementById('categoria').value;
  const capaFile = document.getElementById('capa').files[0];

  if (!linkFilme) {
    mostrarErro('Informe o link do filme!');
    resetarBotao();
    return;
  }

  if (!titulo || !genero || !duracao || !ano || !categoria || !capaFile) {
    mostrarErro('Todos os campos são obrigatórios, incluindo a capa!');
    resetarBotao();
    return;
  }

  if (ano < 1900 || ano > 2030) {
    mostrarErro('Ano deve estar entre 1900 e 2030!');
    resetarBotao();
    return;
  }

  if (filmesAdicionados.some(filme => filme.titulo.toLowerCase() === titulo.toLowerCase())) {
    mostrarErro('Já existe um filme com este título!');
    resetarBotao();
    return;
  }

  const btn = document.querySelector('.btn-adicionar');
  btn.disabled = true;
  btn.textContent = 'ADICIONANDO...';

  const reader = new FileReader();
  reader.onload = function(e) {
    const filme = {
      id: Date.now(),
      titulo,
      genero,
      duracao,
      ano,
      categoria,
      link: linkFilme,
      capa: e.target.result,
      nomeArquivoCapa: capaFile.name,
      dataAdicao: new Date().toISOString()
    };

    filmesAdicionados.push(filme);
    salvarCookie('filmesAdicionados', JSON.stringify(filmesAdicionados), 24);

    fetch('/adicionar-filme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filme)
    })
    .then(res => res.json())
    .then(data => {
      mostrarSucesso();
      document.getElementById('formFilme').reset();
      limparPreview();
      resetarBotao();
    })
    .catch(err => {
      mostrarErro('Erro ao salvar o filme!');
      console.error(err);
      resetarBotao();
    });
  };

  reader.readAsDataURL(capaFile);
});



    function mostrarSucesso() {
      const successMsg = document.getElementById('successMessage');
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 3000);
    }

    function mostrarErro(mensagem) {
      const errorMsg = document.getElementById('errorMessage');
      errorMsg.textContent = mensagem;
      errorMsg.style.display = 'block';
      setTimeout(() => {
        errorMsg.style.display = 'none';
      }, 3000);
    }

    function resetarBotao() {
      const btn = document.querySelector('.btn-adicionar');
      btn.disabled = false;
      btn.textContent = 'ADICIONAR';
    }

    function gerarCSV() {
      if (filmesAdicionados.length === 0) return;
      
      // Cabeçalho do CSV na ordem especificada
      let csvContent = "titulo,ano,genero,duracao,img,link,categoria\n";
      
      // Adiciona cada filme na ordem correta
      filmesAdicionados.forEach(filme => {
        const linha = [
          `"${filme.titulo}"`,
          filme.ano,
          `"${filme.genero}"`,
          `"${filme.duracao}"`,
          `"${filme.capa}"`,  // img (base64)
          `"${linkFilme}"`, // ← adicionar esta linha"`,  // link (vazio por enquanto)
          filme.categoria
        ].join(',');
        csvContent += linha + "\n";
      });
      
      // Cria e baixa o arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "filmes_adicionados.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function limparPreview() {
      const preview = document.getElementById('filePreview');
      preview.innerHTML = `
        <div class="preview-placeholder">
          <span>📁</span>
          <p>Clique para selecionar uma imagem</p>
          <small>Formatos aceitos: JPG, PNG, GIF</small>
        </div>
      `;
    }

    function voltarPagina() {
      if (confirm('Tem certeza que deseja voltar? Os dados não salvos serão perdidos.')) {
         window.location.href = '../1TelaInicial/tela1.html'
        console.log('Voltando para a página anterior...');
      }
    }

    // Preview da imagem selecionada
    document.getElementById('capa').addEventListener('change', function(e) {
      const file = e.target.files[0];
      const preview = document.getElementById('filePreview');
      
      if (file) {
        // Validação do tipo de arquivo
       const extensoesPermitidas = ['image/jpeg', 'image/jpg', 'image/webp'];

if (!extensoesPermitidas.includes(file.type)) {
  mostrarErro('Apenas imagens JPG, JPEG ou WEBP são permitidas!');
  this.value = '';
  return;
}
        
        // Validação do tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          mostrarErro('A imagem deve ter no máximo 5MB!');
          this.value = '';
          return;
        }

        
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview da capa" class="preview-image">
            <button type="button" class="remove-image" onclick="removerImagem()">×</button>
          `;
        };
        reader.readAsDataURL(file);
      }
    });

    function removerImagem() {
      document.getElementById('capa').value = '';
      limparPreview();
    }

    // Validação em tempo real do ano
    document.getElementById('ano').addEventListener('input', function() {
      const ano = parseInt(this.value);
      if (ano && (ano < 1900 || ano > 2030)) {
        this.setCustomValidity('Ano deve estar entre 1900 e 2030');
      } else {
        this.setCustomValidity('');
      }
    });

    // Formatação automática da duração

    document.getElementById('duracao').addEventListener('input', function() {
  let valor = this.value.replace(/[^\d]/g, '');

  if (valor.length === 0) {
    this.value = '';
  } else if (valor.length === 1) {
    // Exemplo: 0 → "0h "
    this.value = valor + 'h ';
  } else if (valor.length === 2 || valor.length === 3) {
    // Exemplo: 012 → "0h 12m"
    this.value = valor.charAt(0) + 'h ' + valor.substring(1) + 'm';
  } else if (valor.length > 3) {
    // Limita a 1 dígito para hora e 2 para minutos
    this.value = valor.charAt(0) + 'h ' + valor.substring(1, 3) + 'm';
  }
});
