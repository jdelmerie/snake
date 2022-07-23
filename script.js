// Définit les variables
window.onload = function () {
    let canvasWidth = 900;
    let canvasHeight = 600;
    let blockSize = 20;
    let ctx;
    let delay = 50;
    let snakee;
    let applee;
    let widthInBlocks = canvasWidth / blockSize;
    let heightInBlocks = canvasHeight / blockSize;
    let score;

    // Mise en place de la structure du jeu
    function start() {
        let canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "20px solid #04196f";
        canvas.style.margin = "30px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#d0d8fd";
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4][2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }
    start();

    // Avancement du serpent
    function refreshCanvas() {
        snakee.advance();
        if (snakee.checkCollision()) {
            gameOver();
        } else {
            if (snakee.EatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                }
                while (applee.OnSnake(snakee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snakee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    // Fonction du game over
    function gameOver() {
        ctx.save();
        ctx.font = "100px sans-serif";
        ctx.fillStyle = "#04196f";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 5;
        let centerX = canvasWidth / 2;
        let centerY = canvasHeight / 2;
        ctx.fillText("Game Over", centerX, centerY - 180);
        ctx.font = "25px sans-serif";
        ctx.fillText("Appuyez sur la touche Espace pour Rejouer", centerX, centerY - 120);
        ctx.restore();
    }

    function replay() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4][2, 4]], "right");
        applee = new Apple([5, 5]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    // Style du score
    function drawScore() {
        ctx.save();
        ctx.font = "bold 150px sans-serif";
        ctx.fillStyle = "#04196f";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let centerX = canvasWidth / 2;
        let centerY = canvasHeight / 2;
        ctx.fillText(score.toString(), centerX, centerY);
        ctx.restore();
    }

    function drawBlock(ctx, position) {
        let x = position[0] * blockSize;
        let y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    // Définit le serpent et sa direction
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#ff3c3c";
            for (let i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };

        this.advance = function () {
            let nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("invalid Direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };

        this.setDirection = function (newDirection) {
            let allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ("invalid Direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkCollision = function () {
            let wallCollision = false;
            let snakeCollision = false;
            let head = this.body[0];
            let restOfBody = this.body.slice(1);
            let snakeX = head[0];
            let snakeY = head[1];
            let minX = 0;
            let minY = 0;
            let maxX = widthInBlocks - 1;
            let maxY = heightInBlocks - 1;
            let OffBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            let OffBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (OffBetweenHorizontalWalls || OffBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (let i = 0; i < restOfBody.length; i++) {
                if (snakeX === restOfBody[i][0] && snakeY === restOfBody[i][1]) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };

        this.EatingApple = function (appleToEat) {
            let head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        };
    }


    // Définit la position aléatoire de la pomme
    function Apple(position) {
        this.position = position;

        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#008500";
            ctx.beginPath();
            let radius = blockSize / 2;
            let x = this.position[0] * blockSize + radius;
            let y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();

        };
        this.setNewPosition = function () {
            let newX = Math.round(Math.random() * (widthInBlocks - 1));
            let newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };

        this.OnSnake = function (snakeToCheck) {
            let OnSnake = false;

            for (let i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    OnSnake = true;
                }
            }
            return OnSnake;
        };

    }

    // Paramètre du clavier
    document.onkeydown = function handleKeyDown(e) {
        let key = e.keyCode;
        let newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                replay();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
}


