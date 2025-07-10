function lerCookie(nome) {
  const valor = `; ${document.cookie}`;
  const partes = valor.split(`; ${nome}=`);
  if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
  return null;
}

function obterParametro(nome) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nome);
}

window.onload = function () {
  const totalCompra = obterParametro('total');
  if (totalCompra) {
    document.getElementById("valor-compra").textContent = `Valor da compra: R$${parseFloat(totalCompra).toFixed(2)}`;
  } else {
    document.getElementById("valor-compra").textContent = "Valor da compra não encontrado.";
  }

  const voltarLink = document.getElementById("voltar-link");
  voltarLink.href = "javascript:history.back()";
};

function finalizarCompra() {
  const numero = document.getElementById("numero").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const mes = document.querySelector(".expiracao-container select:nth-child(1)").value;
  const ano = document.querySelector(".expiracao-container select:nth-child(2)").value;
  const cvv = document.getElementById("cvv").value.trim();

  if (!/^\d{16}$/.test(numero)) {
    alert("Número do cartão deve conter 16 dígitos numéricos.");
    return;
  }

  if (nome === "") {
    alert("Por favor, insira o nome do cartão.");
    return;
  }

  if (mes === "" || ano === "") {
    alert("Por favor, selecione o mês e o ano de expiração.");
    return;
  }

  if (!/^\d{3}$/.test(cvv)) {
    alert("O CVV deve conter 3 números.");
    return;
  }

  alert("Compra finalizada com sucesso!");

  // 🔽 AGORA sim: mostra os botões com os links dos filmes
  const carrinhoStr = lerCookie('carrinho');
  let carrinho = [];
  try {
    carrinho = JSON.parse(carrinhoStr || "[]");
  } catch {
    carrinho = [];
  }

  const container = document.getElementById("botoes-filmes-comprados");
  container.innerHTML = "";

  carrinho.forEach(filme => {
    const botao = document.createElement("button");
    botao.textContent = filme.titulo;
    botao.classList.add("botao-filme-comprado");
    botao.onclick = () => {
      window.open(filme.link, "_blank");
    };
    container.appendChild(botao);
  });

  document.getElementById("link-filme").style.display = "block";

  // Limpa o cookie do carrinho após a compra
  document.cookie = "carrinho=; path=/; max-age=0";
}
