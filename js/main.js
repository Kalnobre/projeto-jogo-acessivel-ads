/* main.js — integra menu, modelo e visão; trata teclado no menu e no tabuleiro */

(function(){

  const menu = document.getElementById("menu-dificuldade");
  const menuBtns = Array.from(document.querySelectorAll(".menu-btn"));
  const menuAnnouncer = document.getElementById("menu-announcer");
  const areaJogo = document.getElementById("area-jogo");
  const btnReiniciar = document.getElementById("btn-reiniciar");
  const btnVoltar = document.getElementById("btn-voltar-menu");
  const gameStatus = document.getElementById("game-status");

  // --- menu: navegação por setas e announcer ---
  let menuIndex = 0;
  function announceMenu(msg){ if(menuAnnouncer) menuAnnouncer.textContent = msg; }

  // foco inicial no primeiro botão
  window.addEventListener("load", () => {
    if (menuBtns.length) {
      menuBtns.forEach((b,i)=> b.tabIndex = i===0 ? 0 : -1);
      menuBtns[0].focus();
      announceMenu(`Dificuldade ${menuBtns[0].dataset.nome}`);
    }
  });

  menuBtns.forEach((btn, i) => {
    btn.addEventListener("focus", () => {
      menuBtns.forEach((b,idx)=> b.tabIndex = idx===i ? 0 : -1);
      menuIndex = i;
      announceMenu(`Dificuldade ${btn.dataset.nome}`);
    });
    btn.addEventListener("mouseenter", () => announceMenu(`Dificuldade ${btn.dataset.nome}`));
    btn.addEventListener("click", () => selecionarDificuldade(btn));
    // permitir Enter/Space selecionar
    btn.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        selecionarDificuldade(btn);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!areaJogo.hidden) return; // se já está no jogo, não mexe no menu
    if (e.key === "ArrowDown") {
      e.preventDefault();
      menuIndex = (menuIndex + 1) % menuBtns.length;
      menuBtns[menuIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      menuIndex = (menuIndex - 1 + menuBtns.length) % menuBtns.length;
      menuBtns[menuIndex].focus();
    }
  });

  // --- selecionar dificuldade e iniciar ---
  function selecionarDificuldade(btn){
    const pares = Number(btn.dataset.pares) || 4;
    const nome = btn.dataset.nome || "Modo";

    announceMenu(`Dificuldade selecionada: ${nome}`);
    iniciarJogo(pares);
  }

  // --- iniciar jogo: criar tabuleiro, pré-carregar sons, montar cartas e ligar controles ---
  function iniciarJogo(pares){
    // esconde menu, mostra jogo
    menu.hidden = true;
    areaJogo.hidden = false;

    // criar tabuleiro no modelo
    const nomes = modeloJogo.criarTabuleiro(pares); // modeloJogo.criarTabuleiro retorna array de nomes
    // OBS: no nosso modeloJogo, criarTabuleiro não retorna nomes; ele atualiza internamente.
    // Para usar os sons, pegaremos via modeloJogo (nomes disponíveis) — no código acima modeloJogo expõe get nomesDosSons? etc.
    // para simplicidade, chamamos visaoJogo.preCarregarSons com os nomes atuais do modelo:
    if (typeof modeloJogo.nomesDosSons !== "undefined") {
      visaoJogo.preCarregarSons(modeloJogo.nomesDosSons);
    } else if (typeof modeloJogo.getNames === "function") {
      visaoJogo.preCarregarSons(modeloJogo.getNames());
    } else {
      // fallback: pre-carrega todos (caso modeloJogo nao expõe)
      visaoJogo.preCarregarSons(["cachorro","cavalo","gato","ovelha","passaro","porco","sapo","vaca"]);
    }

    // montar botões (pares*2)
    const totalCartas = (typeof modeloJogo.totalDePares === "number" ? modeloJogo.totalDePares : pares) * 2;
    visaoJogo.montarCartas(totalCartas);

    // ligar eventos de controle no tabuleiro
    ligarControlesTabuleiro();
    visaoJogo.anunciarStatus("Jogo iniciado. Navegue pelas cartas com as setas e pressione Enter para ouvir.");
  }

  // --- lógica de seleção já delegada ao modelo/visão ---
  function lidarComSelecao(indice) {
    const resultado = modeloJogo.selecionarCarta(indice);

    if (resultado.status === "bloqueado") return;

    if (resultado.nomeDoSom) visaoJogo.tocarSom(resultado.nomeDoSom);

    switch (resultado.status) {
      case "aguardando_segunda_carta":
        visaoJogo.travarCarta(indice);
        visaoJogo.anunciarStatus(`Carta selecionada.`);
        break;

      case "par_encontrado":
        visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2);
        visaoJogo.anunciarStatus(`Par encontrado: ${resultado.nomeDoSom}`);
        break;

      case "jogo_vencido":
        visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2);
        visaoJogo.anunciarStatus("Parabéns! Você encontrou todos os pares.");
        break;

      case "nao_e_par":
        visaoJogo.travarCarta(indice);
        visaoJogo.anunciarStatus("Não é par. Aguarde.");
        setTimeout(() => {
          visaoJogo.desvirarCartas(resultado.indiceCarta1, resultado.indiceCarta2);
          modeloJogo.reiniciarJogada();
          visaoJogo.anunciarStatus("Tente novamente.");
        }, 1200);
        break;
    }
  }

  // --- controle do teclado no tabuleiro (navegação 4 colunas) ---
  function ligarControlesTabuleiro(){
    const botoes = visaoJogo.botoes;
    if (!botoes || botoes.length === 0) return;

    // função para atualizar tabindex e focar
    function setFocus(ind){
      botoes.forEach((b,i)=> b.tabIndex = i===ind ? 0 : -1);
      botoes[ind].focus();
    }

    // iniciar foco no primeiro
    setFocus(0);

    // adicionar listeners
    botoes.forEach((botao, indice) => {
      // clique com mouse
      botao.addEventListener("click", () => {
        lidarComSelecao(indice);
      });

      // keydown nos botões
      botao.addEventListener("keydown", (e) => {
        const colunas = 4;
        const total = botoes.length;
        let novo;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lidarComSelecao(indice);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          novo = (indice + 1) % total;
          setFocus(novo);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          novo = (indice - 1 + total) % total;
          setFocus(novo);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          novo = indice + colunas;
          if (novo >= total) novo = novo % total;
          setFocus(novo);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          novo = indice - colunas;
          if (novo < 0) {
            // calcula última linha na mesma coluna
            const coluna = indice % colunas;
            const ultimaLinhaInicio = Math.floor((total - 1) / colunas) * colunas;
            novo = ultimaLinhaInicio + coluna;
            if (novo >= total) novo -= colunas;
          }
          setFocus(novo);
        }
      });

      // foco via mouse/tab atualiza tabindex
      botao.addEventListener("focus", () => {
        botoes.forEach((b,i)=> b.tabIndex = i===indice ? 0 : -1);
      });
    });
  }

  // --- reiniciar e voltar ao menu ---
  const btnVoltarMenu = document.getElementById("btn-voltar-menu");
  if (btnVoltarMenu) btnVoltarMenu.addEventListener("click", () => {
    areaJogo.hidden = true;
    menu.hidden = false;
    // voltar foco para o menu
    menuBtns[0].focus();
  });

})();
