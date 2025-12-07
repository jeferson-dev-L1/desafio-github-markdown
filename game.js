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

// 💡 VARIÁVEIS DE DIFICULDADE PROGRESSIVA
const INITIAL_SPEED = 120; // Velocidade inicial (ms)
const MIN_SPEED = 50;     // Velocidade mínima (ms) - o mais rápido
const SPEED_DECREMENT = 10; // Quanto a velocidade diminui a cada nível
let currentSpeed = INITIAL_SPEED; // Variável para rastrear a velocidade atual

// 🎵 VARIÁVEIS DE ÁUDIO (SFX)
// Certifique-se que o caminho e a extensão (ex: .wav, .mp3) estão corretos!
const EAT_SOUND_URL = 'assets/eat.wav';
const GAMEOVER_SOUND_URL = 'assets/gameover.wav';

const eatSound = new Audio(EAT_SOUND_URL);
const gameOverSound = new Audio(GAMEOVER_SOUND_URL);

// ===============================
// Define ou Reinicia o Intervalo do Jogo
// ===============================
function setGameInterval() {
    if (gameInterval) clearInterval(gameInterval); 
    gameInterval = setInterval(gameLoop, currentSpeed);
}


// ===============================
// Iniciar Jogo (MODIFICADA)
// ===============================
function initGame() {
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
}

document.getElementById("restartBtn").addEventListener("click", initGame);

// ===============================
// Gerar Comida
// ===============================
function spawnFood() {
     return {
         x: Math.floor(Math.random() * gridSize),
         y: Math.floor(Math.random() * gridSize)
     };
}

// ===============================
// Desenhar fundo
// ===============================
function drawBackground() {
     ctx.fillStyle = "#000";
     ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ===============================
// Desenhar grade (Melhoria de visualização)
// ===============================
function drawGrid() {
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
}

// ===============================
// Desenhar comida
// ===============================
function drawFood() {
     if (!food) return; 

     ctx.fillStyle = "red";
     ctx.fillRect(food.x * box, food.y * box, box, box);
}

// ===============================
// Desenhar cobra
// ===============================
function drawSnake() {
     ctx.fillStyle = "#0f0";
     snake.forEach(part => {
     ctx.fillRect(part.x * box, part.y * box, box - 1, box - 1);
   });
}

// ===============================
// Controles
// ===============================
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// ===============================
// Game Over (MODIFICADA para SFX)
// ===============================
function triggerGameOver() {
  clearInterval(gameInterval);
  gameOver = true;

    // 🎵 Toca o som de Game Over
    gameOverSound.play(); 

   document.getElementById("finalScore").textContent =
     "Pontuação final: " + score;

     document.getElementById("gameOverOverlay").classList.remove("hidden");
}

// ===============================
// Loop principal (MODIFICADA para Dificuldade e SFX)
//===============================
function gameLoop() {
     if (gameOver) return;

     // 1. Desenhar na ordem correta
     drawBackground();
     drawGrid(); // Desenha a grade
     drawFood();
     drawSnake();

     // 2. Mover a cobra 
     let head = { x: snake[0].x, y: snake[0].y };

     if (direction === "UP") head.y--;
     if (direction === "DOWN") head.y++;
     if (direction === "LEFT") head.x--;
     if (direction === "RIGHT") head.x++;

     // 3. Checar Colisões
 
     // Bateu na parede?
     if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize) {
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
}

// Inicia automaticamente
initGame();