body = document.querySelector('body')
tableBody = document.querySelector('tbody');
rows = tableBody.querySelectorAll('tr');

const letters = {
    A: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1]
    ],
    B: [
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 0]
    ],
    G: [
        [0, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    H: [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1]
    ],
    I: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
    ],
    U: [
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    O: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    M: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1]
    ],
    N: [
        [1, 0, 0, 1],
        [1, 1, 0, 1],
        [1, 0, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1]
    ],
    J: [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    R: [
        [1, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 0],
        [1, 0, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1]
    ],
    E: [
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1]
    ],
    S: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
    ],
    " ": [
        [0, 0]
    ],
    "!": [
        [1],
        [1],
        [1],
        [1],
        [1],
        [0],
        [1],
    ],
    ":": [
        [0],
        [0],
        [1],
        [0],
        [1],
        [0],
        [0],
    ],
    ")": [
        [1, 1, 0],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [0, 0, 1],
        [1, 1, 0]
    ],
    "*": [
        [0, 0, 0],
        [0, 0, 0],
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1],
        [0, 0, 0],
        [0, 0, 0]
    ],
    ".": [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [1, 1],
        [1, 1]
    ],
    V: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
    ],
}

function get2DArray(rows, columns) {
    return Array.from({ length: rows }, () => Array(columns).fill(0));
}

function getRandomNumber(min, max) {
    return Math.floor((Math.random() * (max + 1 - min)) + min);
}

// initialise cells
cells = get2DArray(7, 52)
for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    for (let i = 0; i < 52; i++) {
        let cell = document.createElement('td')
        cell.classList.add('cell')
        rows[rowIndex].appendChild(cell);
        cells[rowIndex][i] = cell;
    }
}

async function RenderText(str) {
    grid = get2DArray(7, 200);
    currentColumn = 0;
    maxRow = 0;
    for (const c of str) {
        console.log(c)
        letterData = letters[c];

        for (let y = 0; y < letterData.length; y++) {
            for (let x = 0; x < letterData[0].length; x++) {
                grid[y][currentColumn + x] = letterData[y][x];
                maxRow = Math.max(maxRow, currentColumn + x);
            }
        }

        currentColumn += letterData[0].length + 1;
    }

    let isScrolling = maxRow >= 51;
    if (!isScrolling) {
        let gap = Math.floor((51 - maxRow) / 2);
        for (let y = 0; y < grid.length; y++) {
            grid[y] = Array(gap).fill(0).concat(grid[y].slice(0, -gap))
        }
    }

    revealTimes = get2DArray(7, 52);
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 52; x++) {
            revealTimes[y][x] = getRandomNumber(10, 15);
        }
    }

    let allowedRow = 1;
    let intervalId;
    body.classList.remove('scrolling');
    await new Promise((resolve) => {
        intervalId = setInterval(function() {
            allZero = true;

            for (let y = 0; y < Math.min(7, allowedRow); y++) {
                const row = grid[y];
                for (let x = 0; x < 52; x++) {
                    const cell = cells[y][x];
                    let randomFill;

                    if (revealTimes[y][x] > 0) {
                        randomFill = getRandomNumber(0, 4);
                        revealTimes[y][x] -= 1;
                        allZero = false;
                    } else {
                        randomFill = row[x] == 1 ? getRandomNumber(3, 4) : getRandomNumber(0, 0);
                    }

                    cell.style.backgroundColor = "var(--fill-color-" + randomFill + ")";
                }
            }

            allowedRow += 1;

            if (allZero) {            
                clearInterval(intervalId);
                resolve();
            }
        }, 100);
    });

    if (isScrolling) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        body.classList.add('scrolling');

        await new Promise((resolve) => {
            let scrollAmount = 1;
            let intervalId;
            intervalId = setInterval(function() {
                for (let y = 0; y < 7; y++) {
                    const row = grid[y];
                    for (let x = 0; x < 52; x++) {
                        const cell = cells[y][x];
                        let randomFill = row[scrollAmount + x] == 1 ? getRandomNumber(3, 4) : getRandomNumber(0, 0);
                        cell.style.backgroundColor = "var(--fill-color-" + randomFill + ")";
                    }
                }

                scrollAmount += 1;

                if (maxRow - scrollAmount < 51) {            
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);
        });
    }
}

messages = [
    "HI THERE :)",
    "IM JAMES!",
    //"JAMBIENT.GITHUB.IO",
    " "
]

// Function to render messages with a delay between each
async function renderMessages(messages) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    for (const message of messages) {
        await RenderText(message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
}

// Start rendering messages
renderMessages(messages);