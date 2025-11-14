/*
 * ========================================
 * MODELO (O Cérebro)
 * ========================================
 * - Não sabe sobre HTML ou CSS.
 * - Apenas gerencia o estado do jogo (os dados).
 * - Apenas contém a lógica pura do jogo.
 */

/**
 * Função utilitária para embaralhar um array (Algoritmo Fisher-Yates)
 * @param {array} array O array a ser embaralhado
 * @returns {array} O array embaralhado
 */
function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
    return array;
}

const modeloJogo = {
    // 1. DADOS (O ESTADO)
    // -------------------
    
    // Lista dos nomes de sons (serão os IDs)
    // Usamos IDs simples para referenciar os arquivos (ex: /audio/gato.mp3)
    nomesDosSons: ['gato', 'cachorro', 'vaca', 'passaro', 'sapo', 'cavalo', 'porco', 'ovelha'],
    
    // O tabuleiro real do jogo (será preenchido pela função criarTabuleiro)
    tabuleiro: [], 
    
    // Guarda as cartas que o usuário selecionou nesta rodada (máximo de 2)
    cartasViradas: [], // Ex: [{ indice: 5, nomeDoSom: 'gato' }]
    
    paresEncontrados: 0,
    totalDePares: 8,

    // 2. LÓGICA (AS AÇÕES)
    // -------------------

    /**
     * Preenche o 'tabuleiro' com os pares de sons embaralhados.
     * Esta função DEVE ser chamada quando o jogo começar.
     */
    criarTabuleiro() {
        // Pega os 8 nomes, duplica (para formar os pares)
        const sonsParaEmbaralhar = [...this.nomesDosSons, ...this.nomesDosSons];
        
        // Embaralha e salva no estado
        this.tabuleiro = embaralhar(sonsParaEmbaralhar);
        
        // Reseta o estado do jogo para um novo jogo
        this.cartasViradas = [];
        this.paresEncontrados = 0;
        
        console.log("Modelo: Tabuleiro criado e embaralhado.");
    },

    /**
     * Processa a seleção de uma carta pelo jogador.
     * Esta é a função mais importante do modelo.
     * @param {number} indice O índice (posição) da carta selecionada (0 a 15)
     * @returns {object} Um objeto dizendo ao Controller o que aconteceu.
     */
    selecionarCarta(indice) {
        // (A lógica de checagem de par virá aqui...)
        
        // Por enquanto, vamos só retornar o som da carta
        const nomeDoSom = this.tabuleiro[indice];

        return {
            status: 'carta_virada', // Diz ao controller: "uma carta foi virada"
            nomeDoSom: nomeDoSom     // Diz ao controller: "toque este som"
        };
    }
};