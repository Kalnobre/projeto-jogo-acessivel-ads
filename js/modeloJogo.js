function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const modeloJogo = {
    todosOsSons: ['gato', 'cachorro', 'vaca', 'passaro', 'sapo', 'cavalo', 'porco', 'ovelha'],
    
    // Estado do Jogo
    tabuleiro: [], 
    cartasViradas: [], 
    paresEncontrados: 0,
    totalDePares: 0,
    bloquearCliques: false,
    
    // Configuração Atual
    linhas: 4,
    colunas: 4,

    iniciarJogo(nivel) {
        let numPares;
        
        // Define dificuldade
        switch(nivel) {
            case 'facil':
                this.linhas = 2; this.colunas = 2; numPares = 2;
                break;
            case 'medio':
                this.linhas = 4; this.colunas = 2; numPares = 4;
                break;
            case 'dificil':
                this.linhas = 4; this.colunas = 4; numPares = 8;
                break;
            default:
                this.linhas = 4; this.colunas = 4; numPares = 8;
        }
        
        this.totalDePares = numPares;
        
        const sonsEscolhidos = this.todosOsSons.slice(0, numPares);
        const sonsDuplicados = [...sonsEscolhidos, ...sonsEscolhidos];
        
        this.tabuleiro = embaralhar(sonsDuplicados);
        this.cartasViradas = [];
        this.paresEncontrados = 0;
        this.bloquearCliques = false;
        
        this.salvarProgresso();
    },

    selecionarCarta(indice) {
        if (this.bloquearCliques) return { status: 'bloqueado' };
        if (this.cartasViradas.length === 1 && this.cartasViradas[0].indice === indice) return { status: 'bloqueado' };

        const nomeDoSom = this.tabuleiro[indice];
        this.cartasViradas.push({ indice, nomeDoSom });

        if (this.cartasViradas.length === 1) {
            return { status: 'aguardando_segunda', nomeDoSom };
        }

        const carta1 = this.cartasViradas[0];
        const carta2 = this.cartasViradas[1];

        if (carta1.nomeDoSom === carta2.nomeDoSom) {
            this.paresEncontrados++;
            const idx1 = carta1.indice;
            const idx2 = carta2.indice;
            this.cartasViradas = [];
            
            this.salvarProgresso();

            if (this.paresEncontrados === this.totalDePares) {
                this.limparSave();
                return { status: 'vitoria', nomeDoSom, idx1, idx2 };
            }
            return { status: 'par_encontrado', nomeDoSom, idx1, idx2 };
        } else {
            this.bloquearCliques = true;
            return { status: 'erro', nomeDoSom, idx1: carta1.indice, idx2: carta2.indice };
        }
    },

    reiniciarJogada() {
        this.cartasViradas = [];
        this.bloquearCliques = false;
    },

    // --- SISTEMA DE SAVE (localStorage) ---
    salvarProgresso() {
        const estado = {
            tabuleiro: this.tabuleiro,
            paresEncontrados: this.paresEncontrados,
            totalDePares: this.totalDePares,
            linhas: this.linhas,
            colunas: this.colunas,
        };
        localStorage.setItem('jogoMemoriaSave', JSON.stringify(estado));
    },

    carregarProgresso() {
        const save = localStorage.getItem('jogoMemoriaSave');
        if (!save) return false;

        const estado = JSON.parse(save);
        this.tabuleiro = estado.tabuleiro;
        this.paresEncontrados = estado.paresEncontrados;
        this.totalDePares = estado.totalDePares;
        this.linhas = estado.linhas;
        this.colunas = estado.colunas;
        this.cartasViradas = [];
        this.bloquearCliques = false;
        return true;
    },

    limparSave() {
        localStorage.removeItem('jogoMemoriaSave');
    },
    
    temSave() {
        return !!localStorage.getItem('jogoMemoriaSave');
    }
};