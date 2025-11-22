
document.addEventListener('DOMContentLoaded', () => {
    modeloJogo.criarTabuleiro(); 
    visaoJogo.preCarregarSons(modeloJogo.nomesDosSons);

    visaoJogo.botoes.forEach((botao, indice) => {
        botao.addEventListener('click', () => {
            
            if (botao.getAttribute('aria-disabled') === 'true') {
                return;
            }

            lidarComSelecaoDeCarta(indice);
        });
    });

    visaoJogo.tabuleiro.addEventListener('keydown', (evento) => {
        const celulaFocada = document.activeElement;
        if (!celulaFocada || !celulaFocada.matches('[role="gridcell"]')) {
            return;
        }
        const indiceAtual = Array.from(visaoJogo.botoes).indexOf(celulaFocada);

        if (indiceAtual === -1) {
            return;
        }
        const colunas = 4;
        const totalCartas = visaoJogo.botoes.length;
        let novoIndice = indiceAtual;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evento.key)) {
            evento.preventDefault();
        }

        switch (evento.key) {
            case 'ArrowLeft':
                if (indiceAtual % colunas !== 0) {
                    novoIndice = indiceAtual - 1;
                }
                break;
            case 'ArrowRight':
                if ((indiceAtual + 1) % colunas !== 0) {
                    novoIndice = indiceAtual + 1;
                }
                break;
            case 'ArrowUp':
                if (indiceAtual >= colunas) {
                    novoIndice = indiceAtual - colunas;
                }
                break;
            case 'ArrowDown':
                if (indiceAtual < totalCartas - colunas) {
                    novoIndice = indiceAtual + colunas;
                }
                break;
        }
        if (novoIndice !== indiceAtual) {
            visaoJogo.botoes[novoIndice].focus();
        }
    });

    /**
     * @param {number} indice
     */
    function lidarComSelecaoDeCarta(indice) {
        console.log("CLIQUE DETETADO! Índice:", indice);

        const resultado = modeloJogo.selecionarCarta(indice);
        
        if (resultado.status === 'bloqueado') {
            return;
        }
        visaoJogo.tocarSom(resultado.nomeDoSom);

        switch (resultado.status) {
            case 'aguardando_segunda_carta':
                visaoJogo.anunciarStatus(`Carta virada! Ouça o som...`); 
                
                visaoJogo.travarCarta(indice);
                break;

            case 'par_encontrado':
                visaoJogo.anunciarStatus(`É um par! É o som de ${resultado.nomeDoSom}.`);
                
                visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2, resultado.nomeDoSom);
                break;

            case 'jogo_vencido':
                visaoJogo.anunciarStatus(`Parabéns! Você encontrou todos os pares!`);
                visaoJogo.travarPar(resultado.indiceCarta1, resultado.indiceCarta2, resultado.nomeDoSom);
                break;

            case 'nao_e_par':
                visaoJogo.anunciarStatus(`Não é um par. Ouça o som e tente memorizar.`);
                
                visaoJogo.travarCarta(indice);

                setTimeout(() => {
                    visaoJogo.desvirarCartas(resultado.indiceCarta1, resultado.indiceCarta2);
                    modeloJogo.reiniciarJogada();
                }, 2000); 
                
                break;
        }
    }
});