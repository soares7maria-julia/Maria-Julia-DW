let filmesAdicionados = [];

    document.getElementById('formFilme').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const btn = document.querySelector('.btn-adicionar');
      btn.disabled = true;
      btn.textContent = 'ADICIONANDO...';

      const titulo = document.getElementById('titulo').value.trim();
      const genero = document.getElementById('genero').value.trim();
      const duracao = document.getElementById('duracao').value.trim();
      const ano = parseInt(document.getElementById('ano').value);
      const categoria = document.getElementById('categoria').value;
      const capaFile = document.getElementById('capa').files[0];

      // Validações
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

      // Verifica se já existe um filme com o mesmo título
      if (filmesAdicionados.some(filme => filme.titulo.toLowerCase() === titulo.toLowerCase())) {
        mostrarErro('Já existe um filme com este título!');
        resetarBotao();
        return;
      }

      // Converte a imagem para base64 para armazenar
      const reader = new FileReader();
      reader.onload = function(e) {
        const filme = {
          id: Date.now(),
          titulo,
          genero,
          duracao,
          ano,
          categoria,
          capa: e.target.result, // Imagem em base64
          nomeArquivoCapa: capaFile.name,
          dataAdicao: new Date().toISOString()
        };

        // Simula um delay de processamento
        setTimeout(() => {
          filmesAdicionados.push(filme);
          console.log('Filme adicionado:', filme);
          console.log('Total de filmes:', filmesAdicionados.length);
          
          fetch('/adicionar-filme', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(filme)
})
.then(res => res.json())
.then(data => {
  console.log('Filme salvo no servidor:', data);
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

          
          mostrarSucesso();
          document.getElementById('formFilme').reset();
          limparPreview();
          resetarBotao();
        }, 1000);
      };
      ///////
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
          `""`,  // link (vazio por enquanto)
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
        // Aqui você redirecionaria para a página anterior
        // window.history.back() ou window.location.href = 'pagina-anterior.html'
        console.log('Voltando para a página anterior...');
      }
    }

    // Preview da imagem selecionada
    document.getElementById('capa').addEventListener('change', function(e) {
      const file = e.target.files[0];
      const preview = document.getElementById('filePreview');
      
      if (file) {
        // Validação do tipo de arquivo
        if (!file.type.startsWith('image/')) {
          mostrarErro('Por favor, selecione apenas arquivos de imagem!');
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
      if (valor.length >= 1) {
        if (valor.length <= 2) {
          this.value = valor + 'h ';
        } else if (valor.length <= 4) {
          this.value = valor.substring(0, 2) + 'h ' + valor.substring(2) + 'm';
        }
      }
    });