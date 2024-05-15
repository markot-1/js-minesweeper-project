// Функция для создания элементов с классом

function createElement(tagName, className) {
    const elem = document.createElement(tagName);
    elem.classList.add(className);
    return elem;
}

// Создаем элементы меню

let menu = createElement('div', 'menu');
let menuElemBeginner = createElement('button', 'menu-item');
menuElemBeginner.innerText = 'beginner';
let menuElemMiddle = createElement('button', 'menu-item');
menuElemMiddle.innerText = 'intermediate';
let menuElemExpert = createElement('button', 'menu-item');
menuElemExpert.innerText = 'expert';

let tableWidth = 10;
let tableHeight = 10;
let cellSize = 30;
let totalBombsNumber = 10;
let numOfOpenCells = 0;

// menu.append(menuElemBeginner);
// menu.append(menuElemMiddle);
// menu.append(menuElemExpert);

// Создаем игровое поле

let gameHeader = createElement('div', 'game-header');
let mineCounter = createElement('div', 'counter');
let timer = createElement('div', 'counter');
let smileButton = createElement('div', 'smile');
mineCounter.innerHTML = totalBombsNumber.toString().padStart(3, '0');
timer.innerHTML = '000';

let table = createElement('table', 'game-field');
let cells = document.body.querySelectorAll('table__cell');
let gameFieldSize = tableWidth * cellSize + 'px';
gameHeader.style.width = gameFieldSize;

let gameField = createElement('div', 'game-field');
gameField.style.width = gameFieldSize;
let finalMessage = createElement('p', 'final-message');
finalMessage.innerHTML = '';

gameHeader.append(mineCounter);
gameHeader.append(smileButton);
gameHeader.append(timer);
gameField.append(table);

document.body.prepend(finalMessage);
document.body.prepend(gameField);
document.body.prepend(gameHeader);
// document.body.prepend(menu);

// Создаем таймер, который подсчитывает длительность игры

let interval;
let seconds = 0;

let startTimer = () => {
    seconds++;
    timer.innerHTML = seconds < 10 ? `00${seconds}` : seconds < 100 ? `0${seconds}` : seconds;
};

function timerStart() {
    interval = setInterval(startTimer, 1000);
    this.removeEventListener("click", arguments.callee);
}

// Функции, которые открывают ячейки таблицы

function openCells(event) {
    let y = event.target.parentElement.rowIndex;
    let x = event.target.cellIndex;
    recursionOpenCells(y, x);
}

function recursionOpenCells(y, x) {
    let currentCell = table.rows[y].children[x];
    let bombCells = document.querySelectorAll('.bomb');

    if (currentCell.classList.contains('hidden')) {
        if (!currentCell.classList.contains('flagged')) {
            if (currentCell.classList.contains('bomb')) {
                smileButton.classList.add('lost-game');
                bombCells.forEach((bombCell) => {
                    bombCell.classList.remove('hidden');
                    bombCell.classList.add('open');
                });
                finalMessage.innerHTML = 'Game over. Try again';
                clearInterval(interval);
                table.removeEventListener("click", openCells);
                table.removeEventListener('contextmenu', flagged);

            } else {
                currentCell.classList.remove('hidden');
                currentCell.classList.add('open');
                numOfOpenCells++;
                if (numOfOpenCells == tableWidth * tableHeight - totalBombsNumber) {
                    smileButton.classList.add('win-game');
                    bombCells.forEach((bombCell) => {
                        bombCell.classList.remove('hidden');
                        bombCell.classList.add('open');
                    });
                    finalMessage.innerHTML = `Hooray! You found all mines in ${seconds} seconds!`;
                    clearInterval(interval);
                    table.removeEventListener("click", openCells);
                    table.removeEventListener('contextmenu', flagged);
                }

                if (currentCell.innerText === "") {
                    let xStart = x > 0 ? x - 1 : x;
                    let yStart = y > 0 ? y - 1 : y;
                    let xFinish = x + 1 < tableWidth ? x + 1 : x;
                    let yFinish = y + 1 < tableHeight ? y + 1 : y;
                    for (let i = yStart; i <= yFinish; i++) {
                        for (let j = xStart; j <= xFinish; j++) {
                            recursionOpenCells(i, j);
                        }
                    }
                }
            }
        }
    }
}

let bombsInGame = totalBombsNumber;

function flagged(event) {
    event.preventDefault();
    if (event.target.classList.contains('hidden') && !event.target.classList.contains('flagged')) {
        event.target.classList.add('flagged');
        bombsInGame--;
        mineCounter.innerHTML = bombsInGame.toString().padStart(3, '0');
    } else if (event.target.classList.contains('hidden') && event.target.classList.contains('flagged')) {
        event.target.classList.remove('flagged');
        bombsInGame++;
        mineCounter.innerHTML = bombsInGame.toString().padStart(3, '0');
    }
}

table.addEventListener('click', timerStart);
table.addEventListener('click', openCells);
table.addEventListener('contextmenu', flagged);

smileButton.addEventListener('click', function () {
    smileButton.classList.remove('lost-game');
    smileButton.classList.remove('win-game');
    clearInterval(interval);
    seconds = 0;
    numOfOpenCells = 0;
    timer.innerHTML = '000';
    table.addEventListener('click', timerStart);
    bombsInGame = totalBombsNumber;
    mineCounter.innerHTML = bombsInGame.toString().padStart(3, '0');
    finalMessage.innerHTML = '';

    fillField();
    fillWithBombs();
    table.innerHTML = '';
    cellsFunction();
    table.addEventListener('click', openCells);
    table.addEventListener('contextmenu', flagged);
});

// Заполняем игровое поле контентом

class Cell {
    constructor() {
        this.isBomb = false;
        this.isOpen = false;
        this.minesAround = 0;
        this.x = 0;
        this.y = 0;
    }
}

let field = [];

function fillField() {
    field = [];
    for (let i = 0; i < tableHeight; i++) {
        let column = [];
        for (let j = 0; j < tableWidth; j++) {
            column.push(new Cell());
        }
        field.push(column);
    }
    return field;
}

fillField();

// Заполняем массив бомбами

function fillWithBombs() {
    for (let bomb = 0; bomb < totalBombsNumber;) {
        let x = Math.floor(Math.random() * totalBombsNumber);
        let y = Math.floor(Math.random() * totalBombsNumber);

        if (!field[y][x].isBomb) {
            field[y][x].isBomb = true;
            field[y][x].x = x;
            field[y][x].y = y;
            bomb++;
        }
    }
}

fillWithBombs();

// Функция подсчета бомб рядом с ячейкой

function bombCounter(y, x) {
    let xStart = x > 0 ? x - 1 : x;
    let yStart = y > 0 ? y - 1 : y;
    let xFinish = x < 9 ? x + 1 : x;
    let yFinish = y < 9 ? y + 1 : y;

    let counter = 0;

    for (let i = yStart; i <= yFinish; i++) {
        for (let j = xStart; j <= xFinish; j++) {
            if (field[i][j].isBomb && !(x == j && y == i)) {
                counter++;
            }
        }
    }
    field[y][x].x = x;
    field[y][x].y = y;
    if (counter === 0) {
        field[y][x].minesAround = ' ';
    } else {
        field[y][x].minesAround = counter;
    }
}

// Функция заполнения поля ячейками с контентом

function cellsFunction() {
    for (let i = 0; i < field.length; i++) {
        let tableRow = createElement('tr', 'table__row');
        for (let j = 0; j < field[i].length; j++) {
            let cell = createElement('td', 'table__cell');
            cell.classList.add('hidden');
            bombCounter(i, j);
            if (field[i][j].isBomb) {
                cell.classList.add('bomb');
            } else if (!field[i][j].isBomb) {
                cell.innerHTML = `<p>${field[i][j].minesAround}</p>`;
                switch (field[i][j].minesAround) {
                    case 1:
                        cell.classList.add('case-1');
                        break;
                    case 2:
                        cell.classList.add('case-2');
                        break;
                    case 3:
                        cell.classList.add('case-3');
                        break;
                    case 4:
                        cell.classList.add('case-4');
                        break;
                    case 5:
                        cell.classList.add('case-5');
                        break;
                    case 6:
                        cell.classList.add('case-6');
                        break;
                    default:
                        break;
                }
            }
            tableRow.appendChild(cell);
        }
        table.appendChild(tableRow);
    }
}
cellsFunction();