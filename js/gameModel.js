/*
 * ========================================
 * MODELO (O Cérebro)
 * ========================================
 */

/**
 * Função utilitária para embaralhar um array (Algoritmo Fisher-Yates)
 */
function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const modeloJogo = {
    // 1. DADOS (O ESTADO)
    // -------------------
    nomesDosSons: ['gato', 'cachorro', 'vaca', 'passaro', 'sapo', 'cavalo', 'porco', 'ovelha'],
    tabuleiro: [], 
    cartasViradas: [], // Guarda as cartas viradas temporariamente
    paresEncontrados: 0,
    totalDePares: 8,
    bloquearCliques: false, // NOVA: Impede clicar enquanto processa um erro

    // 2. LÓGICA (AS AÇÕES)
    // -------------------

    criarTabuleiro() {
        const sonsParaEmbaralhar = [...this.nomesDosSons, ...this.nomesDosSons];
        this.tabuleiro = embaralhar(sonsParaEmbaralhar);
        this.cartasViradas = [];
        this.paresEncontrados = 0;
        this.bloquearCliques = false;
        console.log("Modelo: Tabuleiro criado e embaralhado.");
    },

    /**
     * Processa a seleção de uma carta.
     * Retorna um objeto com o 'status' para o Controller saber o que fazer.
     */
    selecionarCarta(indice) {
        // PROTEÇÃO 1: Se o jogo estiver bloqueado (esperando o som de erro terminar)
        if (this.bloquearCliques) {
            return { status: 'bloqueado' };
        }

        // PROTEÇÃO 2: Se clicar na mesma carta que já está virada
        if (this.cartasViradas.length === 1 && this.cartasViradas[0].indice === indice) {
            return { status: 'bloqueado' };
        }

        // Pega o nome do som desta carta
        const nomeDoSom = this.tabuleiro[indice];

        // Adiciona à lista de cartas viradas agora
        this.cartasViradas.push({ indice: indice, nomeDoSom: nomeDoSom });

        // --- CENÁRIO A: É a primeira carta virada ---
        if (this.cartasViradas.length === 1) {
            return {
                status: 'aguardando_segunda_carta',
                nomeDoSom: nomeDoSom
            };
        }

        // --- CENÁRIO B: É a segunda carta (hora da verdade!) ---
        const carta1 = this.cartasViradas[0];
        const carta2 = this.cartasViradas[1];

        if (carta1.nomeDoSom === carta2.nomeDoSom) {
            // ACERTOU! É UM PAR.
            this.paresEncontrados++;
            this.cartasViradas = []; // Limpa a memória para a próxima jogada

            // Verifica se venceu
            if (this.paresEncontrados === this.totalDePares) {
                return { status: 'jogo_vencido', nomeDoSom: nomeDoSom };
            }

            return { status: 'par_encontrado', nomeDoSom: nomeDoSom };

        } else {
            // ERROU! NÃO É PAR.
            // Bloqueia o jogo para o usuário não clicar loucamente
            this.bloquearCliques = true;
            
            return { 
                status: 'nao_e_par', 
                nomeDoSom: nomeDoSom,
                // Enviamos os índices para o Controller saber quem desvirar depois
                indiceCarta1: carta1.indice,
                indiceCarta2: carta2.indice
            };
        }
    },

    /**
     * Chamada pelo Controller após o jogador errar e o som terminar de tocar.
     * Libera o jogo para a próxima tentativa.
     */
    reiniciarJogada() {
        this.cartasViradas = [];
        this.bloquearCliques = false;
    }
};