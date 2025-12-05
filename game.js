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
const GAME_SPEED = 120; 

// ===============================
// Iniciar Jogo
// ===============================
function initGame() {
    snake = [{ x: 10, y: 10 }]; 
    direction = "RIGHT";
    food = spawnFood();
    score = 0;
    gameOver = false;

    document.getElementById("scoreBoard").textContent = "Score: 0";
    document.getElementById("gameOverOverlay").classList.add("hidden");

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
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
// Loop principal
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
    } else {
        snake.pop(); // Remove a cauda
    }

    // Adiciona a nova cabeça na frente
    snake.unshift(head);
}

// Inicia automaticamente
initGame();

