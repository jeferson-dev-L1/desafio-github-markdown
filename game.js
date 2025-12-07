const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Grid
const box = 20; 
const gridSize = canvas.width / box; 

// Variáveis
let snake;
let direction;
let food;
let score;
let gameOver = false;

let gameInterval;

//  VARIÁVEIS DE DIFICULDADE PROGRESSIVA
const INITIAL_SPEED = 120; // Velocidade inicial (ms)
const MIN_SPEED = 50;     // Velocidade mínima (ms) - o mais rápido
const SPEED_DECREMENT = 10; // Quanto a velocidade diminui a cada nível
let currentSpeed = INITIAL_SPEED; // Variável para rastrear a velocidade atual

//  VARIÁVEIS DE ÁUDIO (SFX)
const EAT_SOUND_URL = 'assets/eat.mp3';
const GAMEOVER_SOUND_URL = 'assets/gameover.mp3';

const eatSound = new Audio(EAT_SOUND_URL);
const gameOverSound = new Audio(GAMEOVER_SOUND_URL);

//  FIX PARA POLÍTICA DE AUTOPLAY
let audioUnlocked = false; 


/**
 * Define ou Reinicia o Intervalo do Jogo.
 */
const setGameInterval = () => {
    if (gameInterval) clearInterval(gameInterval); 
    gameInterval = setInterval(gameLoop, currentSpeed);
};


/**
 * Inicia o jogo, redefinindo o estado, pontuação, velocidade e inicializando o game loop.
 */
const initGame = () => {
     snake = [{ x: 10, y: 10 }]; 
     direction = "RIGHT";
     food = spawnFood();
     score = 0;
     gameOver = false;

     document.getElementById("scoreBoard").textContent = "Score: 0";
     document.getElementById("gameOverOverlay").classList.add("hidden");

    // Redefine a velocidade para o padrão inicial
    currentSpeed = INITIAL_SPEED; 

    // Chama a função para iniciar o loop
    setGameInterval();
};

document.getElementById("restartBtn").addEventListener("click", initGame);

/**
 * Gera uma nova posição aleatória para a comida.
 */
const spawnFood = () => {
     return {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
     };
};

/**
 * Desenha o fundo do canvas.
 */
const drawBackground = () => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

/**
 * Desenha a grade (grid) para melhor visualização.
 */
const drawGrid = () => {
     ctx.strokeStyle = "#111"; 
     for (let i = 0; i < gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * box, 0);
        ctx.lineTo(i * box, canvas.height);
        ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(0, i * box);
         ctx.lineTo(canvas.width, i * box);
         ctx.stroke();
     }
};

/**
 * Desenha a comida no canvas.
 */
const drawFood = () => {
    if (!food) return; 

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * box, food.y * box, box, box);
};

/**
 * Desenha cada parte do corpo da cobra.
 */
const drawSnake = () => {
     ctx.fillStyle = "#0f0";
     snake.forEach(part => {
        ctx.fillRect(part.x * box, part.y * box, box - 1, box - 1);
   });
};

// ===============================
// Controles (MODIFICADO para Autoplay Fix)
// ===============================
document.addEventListener("keydown", (e) => {
    //  FIX DE AUTOPLAY: Desbloqueia o áudio na primeira interação de tecla
    if (!audioUnlocked) {
        // Tenta tocar um som e pausa para liberar o contexto
        eatSound.play().catch(() => {}); 
        eatSound.pause(); 
        audioUnlocked = true;
    }

    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

/**
 * Exibe a tela de Game Over e interrompe o loop do jogo.
 */
const triggerGameOver = () => {
     clearInterval(gameInterval);
     gameOver = true;

    //  Toca o som de Game Over
    gameOverSound.play(); 

     document.getElementById("finalScore").textContent =
        "Pontuação final: " + score;

     document.getElementById("gameOverOverlay").classList.remove("hidden");
};

/**
 * O loop principal do jogo, responsável pela atualização de estado e renderização.
 */
const gameLoop = () => {
     if (gameOver) return;

    // 1. Desenhar na ordem correta
    drawBackground();
    drawGrid();
   drawFood();
   drawSnake();

   // 2. Mover a cobra 
     let head = { x: snake[0].x, y: snake[0].y };

     if (direction === "UP") head.y--;
     if (direction === "DOWN") head.y++;
     if (direction === "LEFT") head.x--;
     if (direction === "RIGHT") head.x++;

     // 3. Checar Colisões

     // Bateu na parede? (Melhor Legibilidade)
    const hitWall = head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
    if (hitWall) {
        triggerGameOver();
        return;
    }

     // Bateu no próprio corpo? 
     for (let part of snake.slice(1)) {
     if (part.x === head.x && part.y === head.y) {
         triggerGameOver();
             return;
         }
     }

     // 4. Comer comida
     if (head.x === food.x && head.y === food.y) {
     score++;
         document.getElementById("scoreBoard").textContent = "Score: " + score;
         food = spawnFood();
        
        // 🎵 Toca o som de comer
        eatSound.play();

        // 🚀 LÓGICA DE DIFICULDADE PROGRESSIVA
        if (score % 5 === 0 && currentSpeed > MIN_SPEED) {
            currentSpeed -= SPEED_DECREMENT;
            setGameInterval();
        }
        
     } else {
         snake.pop(); // Remove a cauda
     }

     // Adiciona a nova cabeça na frente
       snake.unshift(head);
};

// Inicia automaticamente
initGame();