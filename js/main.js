/*
 * ========================================
 * CONTROLLER (O Maestro)
 * ========================================
 * - Ouve os eventos do usuário (da View).
 * - "Conversa" com o Modelo para processar a lógica.
 * - Comanda a View para atualizar a tela.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INICIALIZAÇÃO ---
    // Pede ao Modelo para criar o tabuleiro lógico assim que a página carregar
    modeloJogo.criarTabuleiro(); 
    
    // Pede à View para pré-carregar os sons
    // O Controller "conecta" o Modelo e a View
    // (Ainda precisamos implementar 'preloadSounds' na View)
    visaoJogo.preCarregarSons(modeloJogo.nomesDosSons);
    
    // --- 2. ADICIONA OS "ESCUTADORES" DE EVENTOS ---
    
    // Para cada botão (carta) na View...
    visaoJogo.botoes.forEach((botao, indice) => {
        // ...adicionamos um "escutador" de clique.
        botao.addEventListener('click', () => {
            // Quando clicado, chama a função principal do Controller
            lidarComSelecaoDeCarta(indice);
        });
    });

    // (Aqui também entrará sua lógica de navegação por setas,
    // que chamará 'lidarComSelecaoDeCarta' da mesma forma)

    // --- 3. FUNÇÃO PRINCIPAL DO CONTROLLER ---

    /**
     * Ponto central do jogo. Chamado sempre que o usuário seleciona uma carta.
     * @param {number} indice O índice da carta que o usuário clicou.
     */
    function lidarComSelecaoDeCarta(indice) {
        // 1. Pergunta ao Modelo o que fazer com esta seleção
        const resultado = modeloJogo.selecionarCarta(indice);
        
        // Se o modelo retornar 'bloqueado', não faz nada
        if (resultado.status === 'bloqueado') {
            return;
        }

        // 2. Comanda a View para tocar o som (resposta imediata!)
        visaoJogo.tocarSom(resultado.nomeDoSom);

        // 3. Comanda a View para dar o feedback correto (a parte mais importante)
        // Usamos um 'switch' para tratar cada status que o Modelo pode retornar.
        switch (resultado.status) {
            case 'aguardando_segunda_carta':
                // O usuário virou a primeira carta.
                visaoJogo.anunciarStatus(`Você selecionou... ${resultado.nomeDoSom}.`);
                // (Opcional: A View pode 'travar' visualmente esta carta)
                visaoJogo.travarCarta(indice);
                break;

            case 'par_encontrado':
                // O usuário acertou!
                visaoJogo.anunciarStatus(`É um par! ${resultado.nomeDoSom}.`);
                // (A View deve travar permanentemente as duas cartas)
                visaoJogo.travarCarta(modeloJogo.cartasViradas[0].indice);
                visaoJogo.travarCarta(indice);
                break;

            case 'jogo_vencido':
                // O usuário achou o último par!
                visaoJogo.anunciarStatus(`Parabéns! Você encontrou todos os pares e venceu o jogo!`);
                // (A View pode travar a última carta e mostrar uma mensagem de vitória)
                visaoJogo.travarCarta(modeloJogo.cartasViradas[0].indice);
                visaoJogo.travarCarta(indice);
                break;

            case 'nao_e_par':
                // O usuário errou.
                visaoJogo.anunciarStatus(`Não é um par. Tente novamente.`);
                
                // ATENÇÃO: Esta é uma lógica assíncrona (com tempo).
                // Precisamos esperar um pouco (ex: 2 segundos) antes de desvirar.
                setTimeout(() => {
                    // 1. Manda a View desvirar as cartas erradas
                    visaoJogo.desvirarCartas(resultado.indiceCarta1, resultado.indiceCarta2);
                    
                    // 2. Avisa o Modelo que a jogada de erro terminou
                    modeloJogo.reiniciarJogada();
                }, 2000); // Espera 2 segundos (2000ms)
                
                break;
        }
    }
});