function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const modeloJogo = {
    nomesDosSons: ['gato', 'cachorro', 'vaca', 'passaro', 'sapo', 'cavalo', 'porco', 'ovelha'],
    tabuleiro: [], 
    cartasViradas: [],
    paresEncontrados: 0,
    totalDePares: 8,
    bloquearCliques: false,

    criarTabuleiro() {
        const sonsParaEmbaralhar = [...this.nomesDosSons, ...this.nomesDosSons];
        this.tabuleiro = embaralhar(sonsParaEmbaralhar);
        this.cartasViradas = [];
        this.paresEncontrados = 0;
        this.bloquearCliques = false;
        console.log("Modelo: Tabuleiro criado e embaralhado.");
    },

    selecionarCarta(indice) {

        if (this.bloquearCliques) {
            return { status: 'bloqueado' };
        }

        if (this.cartasViradas.length === 1 && this.cartasViradas[0].indice === indice) {
            return { status: 'bloqueado' };
        }

        const nomeDoSom = this.tabuleiro[indice];

        this.cartasViradas.push({ indice: indice, nomeDoSom: nomeDoSom });

        if (this.cartasViradas.length === 1) {
            return {
                status: 'aguardando_segunda_carta',
                nomeDoSom: nomeDoSom
            };
        }
        const carta1 = this.cartasViradas[0];
        const carta2 = this.cartasViradas[1];

        if (carta1.nomeDoSom === carta2.nomeDoSom) {
            this.paresEncontrados++;
            
            const indiceCarta1 = this.cartasViradas[0].indice;
            const indiceCarta2 = this.cartasViradas[1].indice;

            this.cartasViradas = [];

            if (this.paresEncontrados === this.totalDePares) {
                return { 
                    status: 'jogo_vencido', 
                    nomeDoSom: nomeDoSom,
                    indiceCarta1: indiceCarta1,
                    indiceCarta2: indiceCarta2
                };
            }

            return { 
                status: 'par_encontrado', 
                nomeDoSom: nomeDoSom,
                indiceCarta1: indiceCarta1,
                indiceCarta2: indiceCarta2
            };

        } else {
            this.bloquearCliques = true;
            
            return { 
                status: 'nao_e_par', 
                nomeDoSom: nomeDoSom,
                indiceCarta1: carta1.indice,
                indiceCarta2: carta2.indice
            };
        }
    },

    reiniciarJogada() {
        this.cartasViradas = [];
        this.bloquearCliques = false;
    }
};