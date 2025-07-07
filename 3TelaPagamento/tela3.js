function obterParametro(nome) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nome);
}

window.onload = function () {
  const totalCompra = obterParametro('total');
  const valoresBrutos = obterParametro('valores');

  if (totalCompra) {
    document.getElementById("valor-compra").textContent = `Valor da compra: R$${parseFloat(totalCompra).toFixed(2)}`;
  } else {
    document.getElementById("valor-compra").textContent = "Valor da compra não encontrado.";
  }

  // Link de voltar (volta para a tela anterior)
  const voltarLink = document.getElementById("voltar-link");
  voltarLink.href = "javascript:history.back()";
};

function finalizarCompra() {
  const numero = document.getElementById("numero").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const mes = document.querySelector(".expiracao-container select:nth-child(1)").value;
  const ano = document.querySelector(".expiracao-container select:nth-child(2)").value;
  const cvv = document.getElementById("cvv").value.trim();

  // Validações
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

  // Se tudo estiver válido
  alert("Compra finalizada com sucesso!");

  const linkFilmeDiv = document.getElementById("link-filme");
  const linkAssistir = document.getElementById("link-assistir");

  // Como não temos mais a imagem para buscar no CSV, usamos um link padrão
  linkAssistir.href = "https://www.youtube.com/";
  linkFilmeDiv.style.display = "block";
}
