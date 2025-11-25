/* main.js — integra menu, modelo e visão; trata teclado no menu e no tabuleiro */

(function(){

  const menu = document.getElementById("menu-dificuldade");
  const menuBtns = Array.from(document.querySelectorAll(".menu-btn"));
  const menuAnnouncer = document.getElementById("menu-announcer");
  const areaJogo = document.getElementById("area-jogo");
  const btnReiniciar = document.getElementById("btn-reiniciar");
  const btnVoltar = document.getElementById("btn-voltar-menu");
  const gameStatus = document.getElementById("game-status");
  
  // DEFINIÇÕES DE JOGO
  const COLUNAS_FIXAS = 4; 
  // **IMPORTANTE: Ajuste este valor (em milissegundos) para a duração real dos sons dos seus animais.**
  const DURACAO_SOM_ANIMAL = 1500; 
  
  // Flag para controlar o anúncio de posição após o foco programático (acerto)
  let silenciarProximoAnuncioDeFoco = false; 

  /* -------------------------------
     FUNÇÕES DE ANÚNCIO E MAPA
  --------------------------------*/
  function announceMenu(msg){
    if(menuAnnouncer) menuAnnouncer.textContent = msg;
  }
  
  // Mapeia o índice do array para a posição da matriz (1A, 1B, 2A...)
  function indiceParaPosicao(indice, colunas) {
    const linha = Math.floor(indice / colunas) + 1;
    const coluna = String.fromCharCode(65 + (indice % colunas)); 
    return `${linha}${coluna}`;
  }

  /* -------------------------------
     MENU ACESSÍVEL
  --------------------------------*/
  let menuIndex = 0;

  window.addEventListener("load", () => {
    if (menuBtns.length) {
      menuBtns.forEach((b,i)=> b.tabIndex = i===0 ? 0 : -1);
      menuBtns[0].focus();
      announceMenuComTamanho(menuBtns[0]);
    }
  });
  
  function announceMenuComTamanho(btn) {
    const pares = Number(btn.dataset.pares) || 4;
    const nome = btn.dataset.nome || "Modo";
    const totalCartas = pares * 2;
    const linhas = totalCartas / COLUNAS_FIXAS;
    
    // OTIMIZAÇÃO: Dividir em dois anúncios rápidos para evitar a pausa no menu.
    announceMenu(`Dificuldade ${nome}.`);
    
    setTimeout(() => {
      announceMenu(`Tabuleiro de ${linhas} por ${COLUNAS_FIXAS}.`);
    }, 300); // 300ms: Atraso mínimo para garantir que a 1ª mensagem seja iniciada.
  }

  menuBtns.forEach((btn, i) => {
    btn.addEventListener("focus", () => {
      menuBtns.forEach((b,idx)=> b.tabIndex = idx===i ? 0 : -1);
      menuIndex = i;
      announceMenuComTamanho(btn);
    });

    btn.addEventListener("mouseenter",
      () => announceMenuComTamanho(btn)
    );

    btn.addEventListener("click", () => selecionarDificuldade(btn));

    btn.addEventListener("keydown", (e) => {
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        selecionarDificuldade(btn);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (!areaJogo.hidden) return;

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

  /* -------------------------------
     INICIAR JOGO
  --------------------------------*/
  function selecionarDificuldade(btn){
    const pares = Number(btn.dataset.pares) || 4;
    const nome = btn.dataset.nome || "Modo";

    announceMenu(`Dificuldade selecionada: ${nome}`);
    iniciarJogo(pares);
  }

  function iniciarJogo(pares){
    menu.hidden = true;
    areaJogo.hidden = false;

    modeloJogo.criarTabuleiro(pares);

    visaoJogo.preCarregarSons(modeloJogo.nomesDosSons);

    const totalCartas = modeloJogo.totalDePares * 2;
    visaoJogo.montarCartas(totalCartas);

    ligarControlesTabuleiro();
    
    // Anúncio de matriz e esquema de navegação
    const linhas = totalCartas / COLUNAS_FIXAS;
    const primeiraPosicao = indiceParaPosicao(0, COLUNAS_FIXAS);
    
    // 1. Anuncia o início e o tamanho da matriz imediatamente (Prioridade).
    visaoJogo.anunciarStatus(
      `Jogo iniciado. É uma matriz de ${linhas} linhas por ${COLUNAS_FIXAS} colunas.`
    );
    
    // 2. Anuncia as instruções de navegação com um atraso suficiente (1500ms).
    setTimeout(() => {
      visaoJogo.anunciarStatus(
        `As letras significam as colunas e os números, as linhas. Posição atual ${primeiraPosicao}. Navegue com as setas e pressione Enter para ouvir.`
      );
    }, 1500); 
  }

  /* -------------------------------
     SELEÇÃO DE CARTAS - FEEDBACK AJUSTADO
  --------------------------------*/
  function lidarComSelecao(indice){
    const resultado = modeloJogo.selecionarCarta(indice);

    if (resultado.status === "bloqueado") return;

    if (resultado.nomeDoSom)
      visaoJogo.tocarSom(resultado.nomeDoSom);

    switch(resultado.status){

      case "aguardando_segunda_carta":
        visaoJogo.travarCarta(indice);
        
        // Espera o som do animal tocar antes de anunciar a seleção.
        setTimeout(() => {
          visaoJogo.anunciarStatus("Carta selecionada.");
        }, DURACAO_SOM_ANIMAL);
        
        break;

      case "par_encontrado":
        visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2);
        
        // 1. Espera o som tocar + BUFFER DE 1 SEGUNDO
        setTimeout(() => {
          // HACK: Limpa o anúncio com um valor vazio para tentar resetar o leitor de tela (Solução para o título)
          visaoJogo.anunciarStatus(""); 
          
          // Micro-delay para garantir que a limpeza da região ocorra
          setTimeout(() => {
            // Anúncio forte, completo e final 
            visaoJogo.anunciarStatus(`Par encontrado: ${resultado.nomeDoSom}.`);
          
            // 2. Atraso forte (3500ms) para garantir que a frase completa seja lida
            setTimeout(() => {
                // Move focus and announce position
                silenciarProximoAnuncioDeFoco = true; 
                focarProximaCartaValida(resultado.indiceCarta2);
              
                const botoes = visaoJogo.botoes;
                const cartaFocada = botoes.findIndex(b => b === document.activeElement);
                if (cartaFocada !== -1) {
                    const posicao = indiceParaPosicao(cartaFocada, COLUNAS_FIXAS);
                    // MENSAGEM FINAL: Encorajamento e nova posição.
                    visaoJogo.anunciarStatus(`Continue jogando. Posição atual: ${posicao}`); 
                }
            }, 3500);
          }, 10); // Micro-delay (10ms) para limpar
          
        }, DURACAO_SOM_ANIMAL + 1000); // DURACAO_SOM_ANIMAL (1500) + 1000ms de Buffer = 2500ms total
        
        break;

      case "jogo_vencido":
        visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2);
        visaoJogo.anunciarStatus("Parabéns! Você encontrou todos os pares.");
        break;

      case "nao_e_par":
        visaoJogo.travarCarta(indice);
        
        // OTIMIZAÇÃO: Atraso mínimo para feedback de erro (1650ms).
        setTimeout(() => {
          visaoJogo.desvirarCartas(resultado.indiceCarta1, resultado.indiceCarta2);
          modeloJogo.reiniciarJogada();
          
          // Mensagem combinada e elegante + Posição atual
          const posicao = indiceParaPosicao(indice, COLUNAS_FIXAS);
          visaoJogo.anunciarStatus(`Par incorreto. Tente novamente. Posição atual: ${posicao}`);
          
        }, 1650); 
        
        break;
    }
  }

  /* -------------------------------------------------------
     FOCO INTELIGENTE 
  --------------------------------------------------------*/
  function focarProximaCartaValida(indiceAtual){
    const botoes = visaoJogo.botoes;
    const total = botoes.length;

    for (let i = 1; i <= total; i++){
      const idx = (indiceAtual + i) % total;
      const b = botoes[idx];

      if (!b.classList.contains("par-encontrado"))
      {
        botoes.forEach((x,j)=> x.tabIndex = j===idx ? 0 : -1);
        b.focus();
        return;
      }
    }
  }

  /* -------------------------------------------------------
     CONTROLES DO TABULEIRO
  --------------------------------------------------------*/
  function ligarControlesTabuleiro(){
    const botoes = visaoJogo.botoes;
    if (!botoes.length) return;

    const colunas = COLUNAS_FIXAS;

    function proximoValido(indice, delta){
      const total = botoes.length;

      for (let i = 1; i <= total; i++){
        const novo = (indice + delta * i + total) % total;
        if (!botoes[novo].classList.contains("par-encontrado"))
          return novo;
      }
      return indice;
    }

    function setFocus(i){
      botoes.forEach((b,idx)=> b.tabIndex = idx===i ? 0 : -1);
      botoes[i].focus();
    }

    setFocus(0);

    botoes.forEach((botao, indice) => {

      botao.addEventListener("click", () => {
        lidarComSelecao(indice);
      });

      botao.addEventListener("keydown", (e) => {
        let novo;

        if (e.key === "Enter" || e.key === " "){
          e.preventDefault();
          lidarComSelecao(indice);
          return;
        }

        if (e.key === "ArrowRight"){
          e.preventDefault();
          novo = proximoValido(indice, +1);
          setFocus(novo);

        } else if (e.key === "ArrowLeft"){
          e.preventDefault();
          novo = proximoValido(indice, -1);
          setFocus(novo);

        } else if (e.key === "ArrowDown"){
          e.preventDefault();
          novo = proximoValido(indice, colunas);
          setFocus(novo);

        } else if (e.key === "ArrowUp"){
          e.preventDefault();
          novo = proximoValido(indice, -colunas);
          setFocus(novo);
        }
      });

      botao.addEventListener("focus", () => {
        
        if (!silenciarProximoAnuncioDeFoco) {
          // ANÚNCIO PADRÃO: Dispara durante a navegação manual (setas)
          const posicao = indiceParaPosicao(indice, colunas);
          visaoJogo.anunciarStatus(`Posição atual: ${posicao}`);
        } else {
          // ZERA O SILENCIAMENTO: Reseta a flag APÓS o foco programático
          silenciarProximoAnuncioDeFoco = false;
        }
        
        botoes.forEach((b,i)=> b.tabIndex = i===indice ? 0 : -1);
      });
    });
  }

  /* -------------------------------
     VOLTAR AO MENU
  --------------------------------*/
  if (btnVoltar) btnVoltar.addEventListener("click", () => {
    areaJogo.hidden = true;
    menu.hidden = false;
    menuBtns[0].focus();
  });

})();