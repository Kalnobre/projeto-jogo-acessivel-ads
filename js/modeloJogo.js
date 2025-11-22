/* modeloJogo.js
   Controla dados do jogo: seleção de sons, criação do tabuleiro, lógica de seleção.
   Mantém nomes dos sons (relacione com arquivos em /audio/*.wav)
*/

const modeloJogo = (function(){
  const nomesDisponiveis = [
    "cachorro", "cavalo", "gato", "ovelha",
    "passaro", "porco", "sapo", "vaca"
  ];

  let nomesAtuais = []; // sons usados nesta partida
  let tabuleiro = [];   // array de strings (nomes dos sons) duplicados e embaralhados
  let cartasViradas = [];
  let paresEncontrados = 0;
  let totalDePares = 0;
  let bloquear = false;

  function embaralhar(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function criarTabuleiro(qtdPares){
    // garante máximo disponível
    const pares = Math.min(qtdPares, nomesDisponiveis.length);
    totalDePares = pares;
    nomesAtuais = nomesDisponiveis.slice(0, pares);
    const duplicados = [...nomesAtuais, ...nomesAtuais];
    tabuleiro = embaralhar(duplicados);
    cartasViradas = [];
    paresEncontrados = 0;
    bloquear = false;
    return tabuleiro.slice(); // cópia
  }

  function selecionarCarta(indice){
    if (bloquear) return { status: "bloqueado" };
    if (cartasViradas.length === 1 && cartasViradas[0].indice === indice) {
      return { status: "bloqueado" };
    }
    const nome = tabuleiro[indice];
    cartasViradas.push({ indice, nome });
    if (cartasViradas.length === 1) {
      return { status: "aguardando_segunda_carta", nomeDoSom: nome };
    }
    // duas cartas selecionadas
    const c1 = cartasViradas[0];
    const c2 = cartasViradas[1];

    if (c1.nome === c2.nome) {
      paresEncontrados++;
      const i1 = c1.indice, i2 = c2.indice;
      cartasViradas = [];
      if (paresEncontrados === totalDePares) {
        return { status:"jogo_vencido", nomeDoSom:c2.nome, indiceCarta1:i1, indiceCarta2:i2 };
      }
      return { status:"par_encontrado", nomeDoSom:c2.nome, indiceCarta1:i1, indiceCarta2:i2 };
    } else {
      bloquear = true;
      return { status:"nao_e_par", nomeDoSom:c2.nome, indiceCarta1:c1.indice, indiceCarta2:c2.indice };
    }
  }

  function reiniciarJogada(){
    cartasViradas = [];
    bloquear = false;
  }

  // getters públicos
  return {
    criarTabuleiro,
    selecionarCarta,
    reiniciarJogada,
    get nomesDosSons(){ return nomesAtuais.slice(); },
    get totalDePares(){ return totalDePares; }
  };
})();
