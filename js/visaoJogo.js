
const visaoJogo = {
    tabuleiro: document.getElementById('game-board'),
    statusAnuncio: document.getElementById('game-status'),
    botoes: document.querySelectorAll('[role="gridcell"]'),
    cacheDeAudio: {},

    preCarregarSons(nomesDosSons) {
        console.log("Visão: Pré-carregando sons...");
        nomesDosSons.forEach(nome => {
            const audio = new Audio();
            audio.src = `audio/${nome}.wav`;
            this.cacheDeAudio[nome] = audio;
        });
        console.log("Visão: Sons prontos!", this.cacheDeAudio);
    },

    tocarSom(nomeDoSom) {
        console.log("VISÃO: Recebi ordem para tocar:", nomeDoSom);

        const audio = this.cacheDeAudio[nomeDoSom];

        if (audio) {
            audio.currentTime = 0; 
            audio.play().catch(e => console.error("Erro ao tocar áudio:", e));
        } else {
            console.warn(`Visão: Som "${nomeDoSom}" não encontrado no cache!`);
        }
    },

    anunciarStatus(mensagem) {
        this.statusAnuncio.textContent = mensagem;
        console.log("Anúncio:", mensagem);
    },

    travarCarta(indice) {
        const botao = this.botoes[indice];
        botao.classList.add('carta-travada');
        
        const linha = Math.floor(indice / 4) + 1;
        const coluna = (indice % 4) + 1;
        botao.setAttribute('aria-label', `Carta Posição ${linha},${coluna} - Selecionada`);
    },

    travarPar(indice1, indice2, nomeDoSom) {
        const botao1 = this.botoes[indice1];
        const botao2 = this.botoes[indice2];

        botao1.classList.remove('carta-travada');
        botao2.classList.remove('carta-travada');
        
        botao1.classList.add('carta-par-encontrado');
        botao2.classList.add('carta-par-encontrado');

        botao1.setAttribute('aria-disabled', 'true');
        botao2.setAttribute('aria-disabled', 'true');

        const textoAcessivel = `${nomeDoSom} - Par encontrado`;
        botao1.setAttribute('aria-label', textoAcessivel);
        botao2.setAttribute('aria-label', textoAcessivel);
    },

    desvirarCartas(indice1, indice2) {
        const botao1 = this.botoes[indice1];
        const botao2 = this.botoes[indice2];

        botao1.classList.remove('carta-travada');
        botao2.classList.remove('carta-travada');

        const recuperarNomeOriginal = (ind) => {
            const linha = Math.floor(ind / 4) + 1;
            const coluna = (ind % 4) + 1;
            return `Carta Posição ${linha},${coluna}`;
        };

        botao1.setAttribute('aria-label', recuperarNomeOriginal(indice1));
        botao2.setAttribute('aria-label', recuperarNomeOriginal(indice2));
    },

    inicializarCartas() {
        this.botoes.forEach((botao, index) => {
            const linha = Math.floor(index / 4) + 1;
            const coluna = (index % 4) + 1;
            botao.setAttribute('aria-label', `Carta Posição ${linha},${coluna}`);
        });
    },
};