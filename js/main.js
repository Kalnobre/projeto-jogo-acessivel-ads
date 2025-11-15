
document.addEventListener('DOMContentLoaded', () => {
    modeloJogo.criarTabuleiro(); 
    visaoJogo.preCarregarSons(modeloJogo.nomesDosSons);

    visaoJogo.botoes.forEach((botao, indice) => {
        botao.addEventListener('click', () => {
            lidarComSelecaoDeCarta(indice);
        });
    });

    /**
     * @param {number} indice
     */
    function lidarComSelecaoDeCarta(indice) {
        const resultado = modeloJogo.selecionarCarta(indice);
        
        if (resultado.status === 'bloqueado') {
            return;
        }
        visaoJogo.tocarSom(resultado.nomeDoSom);

        switch (resultado.status) {
            case 'aguardando_segunda_carta':
                visaoJogo.anunciarStatus(`Você selecionou... ${resultado.nomeDoSom}.`);
                visaoJogo.travarCarta(indice);
                break;

            case 'par_encontrado':
                visaoJogo.anunciarStatus(`É um par! ${resultado.nomeDoSom}.`);
                visaoJogo.travarPar(modeloJogo.cartasViradas[0].indice, indice);
                break;

            case 'jogo_vencido':
                visaoJogo.anunciarStatus(`Parabéns! Você encontrou todos os pares e venceu o jogo!`);
                visaoJogo.travarPar(modeloJogo.cartasViradas[0].indice, indice);
                break;

            case 'nao_e_par':
                visaoJogo.anunciarStatus(`Não é um par. Tente novamente.`);
                visaoJogo.travarCarta(indice);

                setTimeout(() => {
                    visaoJogo.desvirarCartas(resultado.indiceCarta1, resultado.indiceCarta2);
                    modeloJogo.reiniciarJogada();
                }, 2000); 
                
                break;
        }
    }
});