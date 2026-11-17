// ==========================
// VARIÁVEIS GLOBAIS
// ==========================

// Referências aos elementos do DOM (atribuídas após o carregamento da página)
let productList;
let cartList;
let totalEl;

// Elementos do mini carrinho
let cartCount;
let miniCart;
let miniDropdown;
let miniList;
let miniTotal;

// Elementos do checkout
let btnFinalizar;
let mensagemCompra;

// Elementos do modal de pagamento
let modal;
let formPagamento;
let detalhesPagamento;
let erroPagamento;
let ultimoFoco = null;

// Estado atual do carrinho
let carrinho = [];


// ==========================
// DADOS DOS PRODUTOS
// ==========================

const produtos = [
  { id: 1, nome: "Smartphone", preco: 1500, imagem: "" },
  { id: 2, nome: "Camiseta", preco: 80, imagem: "" },
  { id: 3, nome: "Relógio", preco: 250, imagem: "" },
  { id: 4, nome: "Memória RAM", preco: 800, imagem: "" }
];

// ==========================
// CONFIGURAÇÃO DO PIX
// ==========================
// TROQUE pelos dados reais da sua loja. A chave pode ser CPF/CNPJ (só números),
// e-mail, telefone (+5511999999999) ou chave aleatória.
const PIX = {
  chave: "sua-chave-pix@exemplo.com",
  nome: "Minha Loja Online",   // máx. 25 caracteres
  cidade: "Sua Cidade"         // máx. 15 caracteres
};

// Formas de pagamento disponíveis
const METODOS = [
  { id: "pix", nome: "Pix" },
  { id: "credito", nome: "Cartão de crédito" },
  { id: "debito", nome: "Cartão de débito" },
  { id: "boleto", nome: "Boleto" }
];


// ==========================
// FUNÇÕES AUXILIARES
// ==========================

// Formata número como moeda brasileira (ex.: R$ 1.500,00)
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Soma o valor do carrinho (preço x quantidade de cada produto)
function calcularTotal() {
  return carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

// Quantidade total de unidades no carrinho (usada no contador do topo)
function contarUnidades() {
  return carrinho.reduce((soma, item) => soma + item.quantidade, 0);
}

// Soma ou subtrai unidades de um produto; remove o item se chegar a zero
function alterarQuantidade(id, diferenca) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  item.quantidade += diferenca;

  if (item.quantidade <= 0) {
    removerItem(id);
    return;
  }

  salvarCarrinho();
}

// Remove o produto inteiro do carrinho (todas as unidades)
function removerItem(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  salvarCarrinho();
}

// Imagem de reserva quando o produto não tem foto
function imagemReserva(nome) {
  const inicial = encodeURIComponent(nome.charAt(0).toUpperCase());
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>" +
    "<rect width='100%' height='100%' fill='%23e3e6e0'/>" +
    "<text x='50%' y='54%' font-size='110' font-family='sans-serif' " +
    "fill='%2312384a' text-anchor='middle' dominant-baseline='middle'>" +
    inicial + "</text></svg>";
  return "data:image/svg+xml;utf8," + svg;
}

// Mostra mensagem de feedback ("sucesso" ou "erro")
function mostrarMensagem(texto, tipo) {
  mensagemCompra.textContent = texto;
  mensagemCompra.className = tipo;
}


// ==========================
// RENDERIZAÇÃO DOS PRODUTOS
// ==========================

function renderizarProdutos() {
  productList.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>${formatarPreco(produto.preco)}</p>
      <button type="button">Adicionar ao carrinho</button>
    `;

    // Define a imagem (com reserva se estiver vazia ou quebrada)
    const img = card.querySelector("img");
    const src = (produto.imagem || "").trim();
    img.src = src || imagemReserva(produto.nome);
    img.addEventListener("error", () => {
      img.src = imagemReserva(produto.nome);
    }, { once: true });

    card.querySelector("button").addEventListener("click", () => {
      adicionarAoCarrinho(produto.id);
    });

    productList.appendChild(card);
  });
}


// ==========================
// ADICIONAR PRODUTO AO CARRINHO
// ==========================

function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  // Se o produto já está no carrinho, só aumenta a quantidade
  const existente = carrinho.find(i => i.id === id);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }

  // Limpa mensagem de compra anterior
  mostrarMensagem("", "");

  salvarCarrinho();
}


// ==========================
// RENDERIZAÇÃO DO CARRINHO PRINCIPAL
// ==========================

function renderizarCarrinho() {
  cartList.innerHTML = "";

  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item-info">
        <span class="item-nome">${item.nome}</span>
        <span class="item-detalhe">${item.quantidade}x - ${formatarPreco(subtotal)}</span>
        <span class="item-unitario">${formatarPreco(item.preco)} cada</span>
      </div>
      <div class="item-acoes">
        <div class="qtd" role="group" aria-label="Quantidade de ${item.nome}">
          <button type="button" class="qtd-menos" aria-label="Diminuir quantidade">−</button>
          <span class="qtd-valor">${item.quantidade}</span>
          <button type="button" class="qtd-mais" aria-label="Aumentar quantidade">+</button>
        </div>
        <button type="button" class="item-remover">Remover</button>
      </div>
    `;

    li.querySelector(".qtd-menos").addEventListener("click", () => alterarQuantidade(item.id, -1));
    li.querySelector(".qtd-mais").addEventListener("click", () => alterarQuantidade(item.id, 1));
    li.querySelector(".item-remover").addEventListener("click", () => removerItem(item.id));

    cartList.appendChild(li);
  });

  totalEl.textContent = `Total: ${formatarPreco(calcularTotal())}`;
}


// ==========================
// MINI CARRINHO
// ==========================

function atualizarMiniCarrinho() {
  cartCount.textContent = contarUnidades();
  miniList.innerHTML = "";

  carrinho.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nome}</span>
      <span>${item.quantidade}x - ${formatarPreco(item.preco * item.quantidade)}</span>
    `;
    miniList.appendChild(li);
  });

  miniTotal.textContent = `Total: ${formatarPreco(calcularTotal())}`;
}

// Cria o botão "Finalizar compra" dentro do mini carrinho
function criarBotaoMiniCarrinho() {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "mini-finalizar";
  botao.textContent = "Finalizar compra";
  botao.addEventListener("click", () => {
    miniDropdown.classList.remove("open");
    abrirPagamento();
  });
  miniDropdown.appendChild(botao);
}

// Abre/fecha o dropdown ao clicar no ícone (útil no celular)
function configurarToggleMiniCarrinho() {
  miniCart.setAttribute("tabindex", "0");
  miniCart.setAttribute("role", "button");
  miniCart.setAttribute("aria-label", "Abrir mini carrinho");

  miniCart.addEventListener("click", (e) => {
    if (e.target.closest(".mini-cart-dropdown")) return;
    miniDropdown.classList.toggle("open");
  });

  miniCart.addEventListener("keydown", (e) => {
    if (e.target === miniCart && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      miniDropdown.classList.toggle("open");
    }
  });

  // Fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (!miniCart.contains(e.target)) {
      miniDropdown.classList.remove("open");
    }
  });
}


// ==========================
// PAGAMENTO
// ==========================

// Cria o modal uma única vez e o adiciona ao body
function criarModalPagamento() {
  modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "modal-pagamento";
  modal.hidden = true;

  const opcoes = METODOS.map((m, i) => `
    <label class="pag-opcao">
      <input type="radio" name="metodo" value="${m.id}" ${i === 0 ? "checked" : ""}>
      <span>${m.nome}</span>
    </label>
  `).join("");

  modal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="pag-titulo">
      <h2 id="pag-titulo">Pagamento</h2>
      <p class="pag-total">Total a pagar: <strong id="pag-total-valor"></strong></p>

      <form id="form-pagamento" novalidate>
        <fieldset class="pag-metodos">
          <legend>Escolha a forma de pagamento</legend>
          ${opcoes}
        </fieldset>

        <div id="pag-detalhes"></div>

        <p id="pag-erro" class="pag-erro" role="alert"></p>

        <div class="pag-acoes">
          <button type="button" class="btn-secundario" id="pag-cancelar">Cancelar</button>
          <button type="submit">Confirmar pagamento</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  formPagamento = modal.querySelector("#form-pagamento");
  detalhesPagamento = modal.querySelector("#pag-detalhes");
  erroPagamento = modal.querySelector("#pag-erro");

  // Troca os campos conforme o método escolhido
  formPagamento.addEventListener("change", (e) => {
    if (e.target.name === "metodo") {
      erroPagamento.textContent = "";
      renderizarDetalhes(e.target.value);
    }
  });

  // Máscaras dos campos do cartão
  detalhesPagamento.addEventListener("input", aplicarMascaras);

  // Botão copiar (Pix e boleto)
  detalhesPagamento.addEventListener("click", copiarCodigo);

  formPagamento.addEventListener("submit", (e) => {
    e.preventDefault();
    confirmarPagamento();
  });

  modal.querySelector("#pag-cancelar").addEventListener("click", fecharPagamento);

  // Fecha ao clicar no fundo escuro
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharPagamento();
  });

  // Fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) fecharPagamento();
  });
}

function abrirPagamento() {
  if (carrinho.length === 0) {
    mostrarMensagem("Seu carrinho está vazio!", "erro");
    return;
  }

  ultimoFoco = document.activeElement;
  mostrarMensagem("", "");
  erroPagamento.textContent = "";

  modal.querySelector("#pag-total-valor").textContent = formatarPreco(calcularTotal());

  // Reinicia no primeiro método
  formPagamento.querySelector('input[name="metodo"]').checked = true;
  renderizarDetalhes(METODOS[0].id);

  modal.hidden = false;
  document.body.classList.add("modal-aberto");
  formPagamento.querySelector('input[name="metodo"]:checked').focus();
}

function fecharPagamento() {
  modal.hidden = true;
  document.body.classList.remove("modal-aberto");
  if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
}

// Gera um código de exemplo (simulação, não é um pagamento real)
function gerarCodigo(prefixo, tamanho) {
  let codigo = prefixo;
  while (codigo.length < tamanho) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}

// ---------- Pix: código "copia e cola" e QR Code ----------

// Remove acentos e caracteres especiais (exigência do padrão do Pix)
function limparTexto(texto, max) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max);
}

// Monta um campo no formato ID + tamanho (2 dígitos) + valor
function campoPix(id, valor) {
  return id + String(valor.length).padStart(2, "0") + valor;
}

// CRC16-CCITT (exigido no final do código Pix)
function crc16(texto) {
  let crc = 0xFFFF;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Gera o código Pix "copia e cola" (BR Code estático) com o valor da compra
function gerarPayloadPix(valor) {
  const conta = campoPix("00", "br.gov.bcb.pix") + campoPix("01", PIX.chave);

  const semCrc =
    campoPix("00", "01") +
    campoPix("01", "11") +
    campoPix("26", conta) +
    campoPix("52", "0000") +
    campoPix("53", "986") +
    campoPix("54", valor.toFixed(2)) +
    campoPix("58", "BR") +
    campoPix("59", limparTexto(PIX.nome, 25)) +
    campoPix("60", limparTexto(PIX.cidade, 15)) +
    campoPix("62", campoPix("05", "***")) +
    "6304";

  return semCrc + crc16(semCrc);
}

// Carrega a biblioteca de QR Code só quando for preciso
let promessaQR = null;

function carregarBibliotecaQR() {
  if (window.QRCode) return Promise.resolve();

  if (!promessaQR) {
    promessaQR = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = resolve;
      script.onerror = () => {
        promessaQR = null;
        reject(new Error("Falha ao carregar a biblioteca de QR Code"));
      };
      document.head.appendChild(script);
    });
  }

  return promessaQR;
}

// Desenha o QR Code dentro do container
function desenharQRCode(container, texto) {
  carregarBibliotecaQR()
    .then(() => {
      // O usuário pode ter trocado de método enquanto carregava
      if (!document.body.contains(container)) return;

      container.innerHTML = "";
      new QRCode(container, {
        text: texto,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    })
    .catch(() => {
      if (document.body.contains(container)) {
        container.textContent = "Não foi possível gerar o QR Code. Use o código abaixo.";
      }
    });
}

// Mostra os campos de cada forma de pagamento
function renderizarDetalhes(metodo) {
  const total = calcularTotal();

  // O botão de confirmar muda conforme o método
  const botaoConfirmar = formPagamento.querySelector('button[type="submit"]');
  botaoConfirmar.textContent = metodo === "pix" ? "Já fiz o Pix" : "Confirmar pagamento";

  if (metodo === "pix") {
    const codigo = gerarPayloadPix(total);
    const configurado = !PIX.chave.includes("sua-chave");

    detalhesPagamento.innerHTML = `
      ${configurado ? "" : `
        <p class="pix-aviso">Modo demonstração: troque a chave Pix em <code>PIX.chave</code>
        no arquivo loja.js para receber pagamentos de verdade.</p>
      `}
      <p class="pag-info">Abra o app do seu banco, escolha pagar com Pix e aponte a câmera
      para o QR Code. Se preferir, copie o código abaixo.</p>
      <div class="pix-qr">
        <div class="pix-qr-img" id="pix-qr-img" aria-label="QR Code do Pix">Gerando QR Code...</div>
      </div>
      <div class="pag-copia">
        <input type="text" id="codigo-pagamento" value="${codigo}" readonly aria-label="Pix copia e cola">
        <button type="button" class="btn-secundario" data-copiar="codigo-pagamento">Copiar</button>
      </div>
    `;

    desenharQRCode(detalhesPagamento.querySelector("#pix-qr-img"), codigo);
    return;
  }

  if (metodo === "boleto") {
    const linha = gerarCodigo("34191", 47).replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d+)/, "$1.$2 $3.$4 $5.$6 $7 $8");
    detalhesPagamento.innerHTML = `
      <p class="pag-info">O boleto vence em 3 dias úteis. A compra é confirmada
      após o pagamento ser compensado.</p>
      <div class="pag-copia">
        <input type="text" id="codigo-pagamento" value="${linha}" readonly aria-label="Linha digitável do boleto">
        <button type="button" class="btn-secundario" data-copiar="codigo-pagamento">Copiar</button>
      </div>
    `;
    return;
  }

  // Cartão (crédito ou débito)
  let parcelas = "";
  if (metodo === "credito") {
    let opcoes = "";
    for (let i = 1; i <= 6; i++) {
      opcoes += `<option value="${i}">${i}x de ${formatarPreco(total / i)} sem juros</option>`;
    }
    parcelas = `
      <label class="pag-campo pag-largo">Parcelas
        <select id="cartao-parcelas">${opcoes}</select>
      </label>
    `;
  }

  detalhesPagamento.innerHTML = `
    <div class="pag-grade">
      <label class="pag-campo pag-largo">Número do cartão
        <input type="text" id="cartao-numero" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19">
      </label>
      <label class="pag-campo pag-largo">Nome impresso no cartão
        <input type="text" id="cartao-nome" autocomplete="cc-name" placeholder="Como está no cartão">
      </label>
      <label class="pag-campo">Validade
        <input type="text" id="cartao-validade" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5">
      </label>
      <label class="pag-campo">CVV
        <input type="text" id="cartao-cvv" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4">
      </label>
      ${parcelas}
    </div>
  `;
}

// Máscaras: número, validade e CVV
function aplicarMascaras(e) {
  const campo = e.target;

  if (campo.id === "cartao-numero") {
    const digitos = campo.value.replace(/\D/g, "").slice(0, 16);
    campo.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  if (campo.id === "cartao-validade") {
    const digitos = campo.value.replace(/\D/g, "").slice(0, 4);
    campo.value = digitos.length > 2 ? digitos.slice(0, 2) + "/" + digitos.slice(2) : digitos;
  }

  if (campo.id === "cartao-cvv") {
    campo.value = campo.value.replace(/\D/g, "").slice(0, 4);
  }
}

// Copia o código do Pix ou do boleto
function copiarCodigo(e) {
  const botao = e.target.closest("[data-copiar]");
  if (!botao) return;

  const campo = document.getElementById(botao.dataset.copiar);
  campo.select();

  const copiar = navigator.clipboard
    ? navigator.clipboard.writeText(campo.value)
    : Promise.resolve(document.execCommand("copy"));

  copiar.then(() => {
    botao.textContent = "Copiado!";
    setTimeout(() => { botao.textContent = "Copiar"; }, 1500);
  }).catch(() => {
    botao.textContent = "Selecione e copie";
  });
}

// Valida os campos do cartão; devolve texto de erro ou "" se estiver tudo certo
function validarCartao() {
  const numero = document.getElementById("cartao-numero").value.replace(/\D/g, "");
  const nome = document.getElementById("cartao-nome").value.trim();
  const validade = document.getElementById("cartao-validade").value;
  const cvv = document.getElementById("cartao-cvv").value;

  if (numero.length < 13) return "Informe o número completo do cartão.";
  if (nome.length < 3) return "Informe o nome impresso no cartão.";

  const partes = validade.match(/^(\d{2})\/(\d{2})$/);
  if (!partes) return "Informe a validade no formato MM/AA.";

  const mes = Number(partes[1]);
  const ano = 2000 + Number(partes[2]);
  if (mes < 1 || mes > 12) return "O mês da validade é inválido.";

  const agora = new Date();
  if (ano < agora.getFullYear() || (ano === agora.getFullYear() && mes < agora.getMonth() + 1)) {
    return "Este cartão está vencido.";
  }

  if (cvv.length < 3) return "Informe o CVV do cartão.";

  return "";
}

// Confirma o pagamento e finaliza a compra
function confirmarPagamento() {
  const metodoId = formPagamento.querySelector('input[name="metodo"]:checked').value;
  const metodo = METODOS.find(m => m.id === metodoId);

  if (metodoId === "credito" || metodoId === "debito") {
    const erro = validarCartao();
    if (erro) {
      erroPagamento.textContent = erro;
      return;
    }
  }

  let resumo = metodo.nome;
  if (metodoId === "credito") {
    const n = Number(document.getElementById("cartao-parcelas").value);
    resumo += n === 1 ? " em 1x" : ` em ${n}x`;
  }

  const total = formatarPreco(calcularTotal());

  finalizarCompra(resumo, total, metodoId);
  fecharPagamento();
}


// ==========================
// FINALIZAR COMPRA
// ==========================

// Botão "Finalizar Compra": abre o pagamento (se houver itens)
function iniciarFinalizacao() {
  if (carrinho.length === 0) {
    mostrarMensagem("Seu carrinho está vazio!", "erro");
    return;
  }
  abrirPagamento();
}

// Conclui a compra depois que o pagamento foi confirmado
function finalizarCompra(resumo, total, metodoId) {
  const aviso = metodoId === "boleto"
    ? ` Pague o boleto em até 3 dias úteis para confirmar.`
    : "";

  mostrarMensagem(`Compra de ${total} realizada com sucesso! Pagamento: ${resumo}.${aviso}`, "sucesso");

  carrinho = [];
  salvarCarrinho();
}


// ==========================
// PERSISTÊNCIA (LOCALSTORAGE)
// ==========================

// Salva o carrinho no navegador e atualiza a interface
function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderizarCarrinho();
  atualizarMiniCarrinho();
}

// Lê o carrinho salvo (ignora dados corrompidos)
function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem("carrinho"));
    if (!Array.isArray(salvo)) return [];

    // Agrupa por produto. Também converte o formato antigo, em que o mesmo
    // produto aparecia várias vezes na lista, cada um sem quantidade.
    const agrupado = [];

    salvo.forEach(item => {
      const produto = produtos.find(p => p.id === item.id);
      if (!produto) return; // ignora produtos que não existem mais

      const qtd = Number.isInteger(item.quantidade) && item.quantidade > 0 ? item.quantidade : 1;
      const existente = agrupado.find(i => i.id === produto.id);

      if (existente) {
        existente.quantidade += qtd;
      } else {
        agrupado.push({ ...produto, quantidade: qtd });
      }
    });

    return agrupado;
  } catch (erro) {
    return [];
  }
}


// ==========================
// INICIALIZAÇÃO DO SISTEMA
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // Captura elementos do DOM
  productList = document.getElementById("product-list");
  cartList = document.getElementById("cart-list");
  totalEl = document.getElementById("total");

  cartCount = document.getElementById("cart-count");
  miniList = document.getElementById("mini-cart-list");
  miniTotal = document.getElementById("mini-total");
  miniDropdown = document.getElementById("mini-cart-dropdown");
  miniCart = miniDropdown.closest(".mini-cart");

  btnFinalizar = document.getElementById("finalizar-compra");
  mensagemCompra = document.getElementById("mensagem-compra");

  // Recupera dados salvos
  carrinho = carregarCarrinho();

  // Monta a interface
  criarModalPagamento();
  criarBotaoMiniCarrinho();
  configurarToggleMiniCarrinho();

  renderizarProdutos();
  renderizarCarrinho();
  atualizarMiniCarrinho();

  // Botão finalizar compra abre a etapa de pagamento
  btnFinalizar.addEventListener("click", iniciarFinalizacao);
});