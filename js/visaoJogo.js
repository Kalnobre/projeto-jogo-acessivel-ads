const visaoJogo = {
    tabuleiroDiv: document.getElementById('game-board'),
    statusAnuncio: document.getElementById('game-status'),
    cacheAudio: {},
    botoes: [],

    gerarTabuleiro(linhas, colunas, cartasJaEncontradas = []) {
        this.tabuleiroDiv.innerHTML = '';
        this.tabuleiroDiv.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;

        const totalCartas = linhas * colunas;

        for (let i = 0; i < totalCartas; i++) {
            const btn = document.createElement('button');
            btn.setAttribute('role', 'gridcell');
            btn.dataset.indice = i; 
            
            const l = Math.floor(i / colunas) + 1;
            const c = (i % colunas) + 1;
            btn.setAttribute('aria-label', `Carta da linha ${l}, coluna ${c}`);

            this.tabuleiroDiv.appendChild(btn);
        }

        this.botoes = document.querySelectorAll('[role="gridcell"]');
    },

    preCarregarSons(nomes) {
        nomes.forEach(nome => {
            if(!this.cacheAudio[nome]) {
                const audio = new Audio();
                audio.src = `audio/${nome}.wav`; 
                this.cacheAudio[nome] = audio;
            }
        });
    },

    tocarSom(nome) {
        const audio = this.cacheAudio[nome];
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    },

    anunciarStatus(mensagem) {
        this.statusAnuncio.innerHTML = '';
        setTimeout(() => {
            const p = document.createElement('p');
            p.innerText = mensagem;
            this.statusAnuncio.appendChild(p);
        }, 500); 
    },

    atualizarCarta(indice, tipo, nomeSom = '') {
        const btn = this.botoes[indice];
        if (!btn) return;

        if (tipo === 'selecionada') {
            btn.classList.add('carta-travada');
        } else if (tipo === 'par') {
            btn.classList.remove('carta-travada');
            btn.classList.add('carta-par-encontrado');
            btn.setAttribute('aria-disabled', 'true');
            btn.setAttribute('aria-label', `${nomeSom} - Par Encontrado`);
        } else if (tipo === 'reset') {
            btn.classList.remove('carta-travada');
            const colunas = window.getComputedStyle(this.tabuleiroDiv).gridTemplateColumns.split(' ').length;
            const l = Math.floor(indice / colunas) + 1;
            const c = (indice % colunas) + 1;
            btn.setAttribute('aria-label', `Carta da linha ${l}, coluna ${c}`);
        }
    },
    
    restaurarVisual(tabuleiroLogico) {
    }
};