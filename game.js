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

// 💡 VARIÁVEIS DE DIFICULDADE PROGRESSIVA (NOVAS)
const INITIAL_SPEED = 120; // Velocidade inicial (ms)
const MIN_SPEED = 50;     // Velocidade mínima (ms) - o mais rápido
const SPEED_DECREMENT = 10; // Quanto a velocidade diminui a cada nível
let currentSpeed = INITIAL_SPEED; // Variável para rastrear a velocidade atual

// ===============================
// Define ou Reinicia o Intervalo do Jogo (NOVA FUNÇÃO)
// ===============================
function setGameInterval() {
    // Limpa o intervalo antigo antes de criar um novo
    if (gameInterval) clearInterval(gameInterval); 
    // Inicia o novo intervalo usando a velocidade atual (currentSpeed)
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

    // Chama a nova função para iniciar o loop
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
// Desenhar comida (CORRIGIDO: Previne TypeError)
// ===============================
function drawFood() {
    // 💡 CORREÇÃO: Verifica se 'food' existe antes de tentar desenhar
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
// Game Over
// ===============================
function triggerGameOver() {
    clearInterval(gameInterval);
    gameOver = true;

    document.getElementById("finalScore").textContent =
        "Pontuação final: " + score;

    document.getElementById("gameOverOverlay").classList.remove("hidden");
}

// ===============================
// Loop principal (MODIFICADO)
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

    // Bateu no próprio corpo? (CORRIGIDO: Usa .slice(1) para ignorar a cabeça)
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
        
        // 🚀 LÓGICA DE DIFICULDADE PROGRESSIVA (ADICIONADA)
        // Checa se a pontuação é um múltiplo de 5 E se ainda não atingiu a velocidade mínima
        if (score % 5 === 0 && currentSpeed > MIN_SPEED) {
            currentSpeed -= SPEED_DECREMENT; // Diminui o tempo de intervalo (fica mais rápido)
            setGameInterval();              // Reinicia o loop com a nova velocidade
        }
        
    } else {
        snake.pop(); // Remove a cauda
    }

    // Adiciona a nova cabeça na frente
    snake.unshift(head);
}

// Inicia automaticamente
initGame();