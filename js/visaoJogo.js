
const visaoJogo = {
    tabuleiro: document.getElementById('game-board'),
    statusAnuncio: document.getElementById('game-status'),
    botoes: document.querySelectorAll('[role="gridcell"]'),
    cacheDeAudio: {},

    /**
     * @param {string[]} nomesDosSons
     */
    preCarregarSons(nomesDosSons) {
        console.log("Visão: Pré-carregando sons...");
        nomesDosSons.forEach(nome => {
            const audio = new Audio();
            audio.src = `audio/${nome}.wav`;
            this.cacheDeAudio[nome] = audio;
        });
        console.log("Visão: Sons prontos!", this.cacheDeAudio);
    },

    /**
     * @param {string} nomeDoSom
     */
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

    /**
     * @param {string} mensagem
     */
    anunciarStatus(mensagem) {
        this.statusAnuncio.textContent = mensagem;
        console.log("Anúncio:", mensagem);
    },

    /**
     * @param {number} indice
     */
    travarCarta(indice) {
        const botao = this.botoes[indice];
        botao.classList.add('carta-travada');
    },

    /**
     * @param {number} indice1
     * @param {number} indice2
     */
    travarPar(indice1, indice2) {
        const botao1 = this.botoes[indice1];
        const botao2 = this.botoes[indice2];

        botao1.classList.remove('carta-travada');
        botao2.classList.remove('carta-travada');
        
        botao1.classList.add('carta-par-encontrado');
        botao2.classList.add('carta-par-encontrado');

        botao1.disabled = true;
        botao2.disabled = true;
    },

    /**
     * @param {number} indice1
     * @param {number} indice2
     */
    desvirarCartas(indice1, indice2) {
        this.botoes[indice1].classList.remove('carta-travada');
        this.botoes[indice2].classList.remove('carta-travada');
    }
};