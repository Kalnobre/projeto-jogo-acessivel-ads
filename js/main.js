document.addEventListener('DOMContentLoaded', () => {
    
    // --- REFERÊNCIAS DE TELA ---
    const telaMenu = document.getElementById('tela-menu');
    const telaJogo = document.getElementById('tela-jogo');
    const telaModal = document.getElementById('tela-modal');
    const btnContinuar = document.getElementById('btn-continuar');

    visaoJogo.preCarregarSons(modeloJogo.todosOsSons);

    if (modeloJogo.temSave()) {
        btnContinuar.disabled = false;
        btnContinuar.innerText = "Continuar Jogo Salvo (Encontrados: " + JSON.parse(localStorage.getItem('jogoMemoriaSave')).paresEncontrados + ")";
    }

    // --- FUNÇÕES DE NAVEGAÇÃO ---
    function mostrarJogo() {
        telaMenu.classList.add('escondido');
        telaModal.classList.add('escondido');
        telaJogo.classList.remove('escondido');
        
        visaoJogo.gerarTabuleiro(modeloJogo.linhas, modeloJogo.colunas);
        conectarEventosDeJogo();
        
        setTimeout(() => visaoJogo.botoes[0]?.focus(), 100);
    }

    function mostrarMenu() {
        telaJogo.classList.add('escondido');
        telaModal.classList.add('escondido');
        telaMenu.classList.remove('escondido');
        
        if (modeloJogo.temSave()) {
            btnContinuar.disabled = false;
        }
    }

    // --- EVENTOS DO MENU ---
    document.getElementById('btn-facil').addEventListener('click', () => {
        modeloJogo.iniciarJogo('facil');
        mostrarJogo();
    });

    document.getElementById('btn-medio').addEventListener('click', () => {
        modeloJogo.iniciarJogo('medio');
        mostrarJogo();
    });

    document.getElementById('btn-dificil').addEventListener('click', () => {
        modeloJogo.iniciarJogo('dificil');
        mostrarJogo();
    });

    btnContinuar.addEventListener('click', () => {
        if (modeloJogo.carregarProgresso()) {
            mostrarJogo();
            visaoJogo.anunciarStatus("Jogo carregado. Cartas re-embaralhadas visualmente.");
        }
    });

    document.getElementById('btn-ajuda').addEventListener('click', () => {
        mostrarModal("Ajuda", "Use as setas para navegar. Enter para virar. Memorize os sons e ache os pares. O jogo salva automaticamente.");
    });
    
    document.getElementById('btn-creditos').addEventListener('click', () => {
        mostrarModal("Créditos", "Desenvolvido por: [Seu Nome] e Equipe. Projeto de ADS - 4º Período.");
    });

    document.getElementById('btn-fechar-modal').addEventListener('click', () => {
        telaModal.classList.add('escondido');
    });

    function mostrarModal(titulo, texto) {
        document.getElementById('modal-titulo').innerText = titulo;
        document.getElementById('modal-texto').innerText = texto;
        telaModal.classList.remove('escondido');
        document.getElementById('btn-fechar-modal').focus();
    }

    // --- EVENTOS DENTRO DO JOGO ---
    document.getElementById('btn-voltar-menu').addEventListener('click', mostrarMenu);
    
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
        let nivel = 'dificil';
        if (modeloJogo.totalDePares === 2) nivel = 'facil';
        if (modeloJogo.totalDePares === 4) nivel = 'medio';
        
        modeloJogo.iniciarJogo(nivel);
        mostrarJogo();
        visaoJogo.anunciarStatus("Jogo reiniciado.");
    });

    // --- LÓGICA DO JOGO (Conecta aos botões dinâmicos) ---
    function conectarEventosDeJogo() {
        const tabuleiro = document.getElementById('game-board');
        
        const novoTabuleiro = tabuleiro.cloneNode(true);
        tabuleiro.parentNode.replaceChild(novoTabuleiro, tabuleiro);
        visaoJogo.tabuleiroDiv = novoTabuleiro;
        
        visaoJogo.botoes = novoTabuleiro.querySelectorAll('[role="gridcell"]');

        novoTabuleiro.addEventListener('keydown', (e) => {
            const focoAtual = document.activeElement;
            const index = Array.from(visaoJogo.botoes).indexOf(focoAtual);
            if (index === -1) return;

            let novoIndex = index;
            const cols = modeloJogo.colunas;
            const total = visaoJogo.botoes.length;

            if (e.key === 'ArrowRight' && (index + 1) % cols !== 0) novoIndex++;
            if (e.key === 'ArrowLeft' && index % cols !== 0) novoIndex--;
            if (e.key === 'ArrowDown' && index + cols < total) novoIndex += cols;
            if (e.key === 'ArrowUp' && index - cols >= 0) novoIndex -= cols;

            if (novoIndex !== index) {
                e.preventDefault();
                visaoJogo.botoes[novoIndex].focus();
            }
        });

        visaoJogo.botoes.forEach((botao, indice) => {
            botao.addEventListener('click', () => {
                if (botao.getAttribute('aria-disabled') === 'true') return;
                processarJogada(indice);
            });
        });
    }

    function processarJogada(indice) {
        const res = modeloJogo.selecionarCarta(indice);
        if (res.status === 'bloqueado') return;

        visaoJogo.tocarSom(res.nomeDoSom);

        if (res.status === 'aguardando_segunda') {
            visaoJogo.anunciarStatus("Carta virada.");
            visaoJogo.atualizarCarta(indice, 'selecionada');
        } 
        else if (res.status === 'par_encontrado') {
            visaoJogo.anunciarStatus(`Par de ${res.nomeDoSom}!`);
            visaoJogo.atualizarCarta(res.idx1, 'par', res.nomeDoSom);
            visaoJogo.atualizarCarta(res.idx2, 'par', res.nomeDoSom);
        }
        else if (res.status === 'vitoria') {
            visaoJogo.anunciarStatus(`Vitória! Jogo salvo limpo.`);
            visaoJogo.atualizarCarta(res.idx1, 'par', res.nomeDoSom);
            visaoJogo.atualizarCarta(res.idx2, 'par', res.nomeDoSom);
        }
        else if (res.status === 'erro') {
            visaoJogo.anunciarStatus("Errou.");
            visaoJogo.atualizarCarta(indice, 'selecionada');
            setTimeout(() => {
                visaoJogo.atualizarCarta(res.idx1, 'reset');
                visaoJogo.atualizarCarta(res.idx2, 'reset');
                modeloJogo.reiniciarJogada();
            }, 2000);
        }
    }
});