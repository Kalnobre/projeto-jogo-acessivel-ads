/* visaoJogo.js
   Renderiza o tabuleiro, pré-carrega sons, toca som, atualiza estados visuais e anuncia status.
*/

const visaoJogo = (function(){
  const boardEl = document.getElementById("game-board");
  const statusEl = document.getElementById("game-status");
  let botoes = []; // lista de elementos .card
  const cacheAudio = {};

  function preCarregarSons(nomes){
    // carrega e guarda instâncias de áudio
    nomes.forEach(nome => {
      try {
        const a = new Audio(`audio/${nome}.wav`);
        cacheAudio[nome] = a;
      } catch(e){}
    });
  }

  function tocarSom(nome){
    const audio = cacheAudio[nome] || new Audio(`audio/${nome}.wav`);
    try {
      audio.currentTime = 0;
      audio.play().catch(err => {
        // falha de autoplay talvez — ignore silenciosamente
        console.warn("Erro ao tocar áudio:", err);
      });
    } catch(e){
      console.warn("Erro tocando som:", e);
    }
  }

  function anunciarStatus(msg){
    if(statusEl) {
      statusEl.textContent = msg;
    }
    console.log("ANUNCIO:", msg);
  }

  function montarCartas(totalCartas){
    boardEl.innerHTML = "";
    botoes = [];
    for(let i=0;i<totalCartas;i++){
      const btn = document.createElement("button");
      btn.className = "card";
      btn.setAttribute("role","gridcell");
      btn.setAttribute("aria-label", `Carta ${i+1}`);
      btn.tabIndex = -1; // foco controlado
      btn.textContent = "?";
      boardEl.appendChild(btn);
      botoes.push(btn);
    }
    // define primeiro focável
    if (botoes.length) botoes[0].tabIndex = 0;
    return botoes;
  }

  function atualizarReferencias(){
    // atualizar botoes caso necessidade
    // no nosso uso, montarCartas já atualiza botoes
  }

  function travarCarta(indice){
    const b = botoes[indice];
    if (b) b.classList.add("travada");
  }

  function travarPar(i1,i2){
    const a = botoes[i1], b = botoes[i2];
    if (a && b){
      a.classList.add("par-encontrado");
      b.classList.add("par-encontrado");
      a.disabled = true; b.disabled = true;
      a.classList.remove("travada"); b.classList.remove("travada");
    }
  }

  function desvirarCartas(i1,i2){
    const a = botoes[i1], b = botoes[i2];
    if (a) a.classList.remove("travada");
    if (b) b.classList.remove("travada");
  }

  return {
    preCarregarSons,
    tocarSom,
    anunciarStatus,
    montarCartas,
    travarCarta,
    travarPar,
    desvirarCartas,
    get botoes(){ return botoes; }
  };
})();
