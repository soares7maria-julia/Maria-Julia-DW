function lerCookie(nome) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nome}=`);
  if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
  return null;
}

function salvarCookie(nome, valor, horasValidade = 1) {
  const dataExpiracao = new Date();
  dataExpiracao.setTime(dataExpiracao.getTime() + (horasValidade * 60 * 60 * 1000));
  document.cookie = `${nome}=${encodeURIComponent(valor)}; path=/; expires=${dataExpiracao.toUTCString()}`;
}

// Verificar se o usuário está logado e tem permissão
const cookieBruto = lerCookie('usuarioLogado');
const usuario = cookieBruto ? JSON.parse(cookieBruto) : null;

if (!usuario || (usuario.tipo === 'normal')) {
  alert('Acesso negado. Apenas colaboradores e chefes podem adicionar filmes.');
  window.location.href = '../1TelaInicial/tela1.html';
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

// ✅ FORM DE ADICIONAR FILME - CORRIGIDO
document.getElementById('formFilme').addEventListener('submit', function(e) {
  e.preventDefault();

  const linkFilme = document.getElementById('linkFilme').value.trim();
  const titulo = document.getElementById('titulo').value.trim();
  const genero = document.getElementById('genero').value.trim();
  const duracao = document.getElementById('duracao').value.trim();
  const ano = parseInt(document.getElementById('ano').value);
  const categoria = document.getElementById('categoria').value;
  const capaFile = document.getElementById('capa').files[0];

  if (!linkFilme || !titulo || !genero || !duracao || !ano || !categoria || !capaFile) {
    mostrarErro('Todos os campos são obrigatórios!');
    resetarBotao();
    return;
  }

  if (ano < 1900 || ano > 2030) {
    mostrarErro('Ano deve estar entre 1900 e 2030!');
    resetarBotao();
    return;
  }

  const btn = document.querySelector('.btn-adicionar');
  btn.disabled = true;
  btn.textContent = 'ADICIONANDO...';

  const formData = new FormData();
  formData.append('titulo', titulo);
  formData.append('genero', genero);
  formData.append('duracao', duracao);
  formData.append('ano', ano);
  formData.append('categoria', categoria);
  formData.append('link', linkFilme);
  formData.append('dataAdicao', new Date().toISOString());
  formData.append('capa', capaFile);

  fetch('http://localhost:3000/adicionar-filme', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json()) // ✅ Corrigido: converte para JSON
  .then(data => {
    console.log('Resposta do servidor:', data); // ✅ Debug
    
    if (data.success || data.message) {
      mostrarSucesso();
      document.getElementById('formFilme').reset();
      limparPreview();
      resetarBotao();

      // ✅ Salvar filme adicionado localmente para atualização da tela inicial
      const novoFilme = {
        titulo: titulo,
        genero: genero,
        duracao: duracao,
        ano: ano,
        categoria: categoria,
        link: linkFilme,
        capa: data.filme && data.filme.capa
  ? data.filme.capa.startsWith('/img/')
    ? data.filme.capa
    : `/img/${data.filme.capa}`
  : `/img/${capaFile.name}`,
  
        dataAdicao: new Date().toISOString()
      };

      filmesAdicionados.push(novoFilme);
      salvarCookie('filmesAdicionados', JSON.stringify(filmesAdicionados), 24); // ✅ Salva por 24 horas
      
      console.log('Filme adicionado:', novoFilme);
      
    } else {
      mostrarErro(data.error || 'Erro ao salvar o filme!');
      resetarBotao();
    }
  })
  .catch(error => {
    console.error('Erro na requisição:', error);
    mostrarErro('Erro de conexão com o servidor!');
    resetarBotao();
  });
});

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
     `"${filme.capa}"`,
      `"${filme.link}"`,
      filme.categoria
    ].join(',');
    csvContent += linha + "\n";
  });
  
  // Cria e baixa o arquivo CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "InfoFilmes.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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