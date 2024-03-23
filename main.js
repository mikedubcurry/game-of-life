import './style.css'

const canvas = document.getElementById('canvas')
const { width, height } = document.body.getBoundingClientRect()


let frame;
let gameState = 'stopped'

const pixelSize = 25;
const colCount = Math.floor(width / pixelSize)
const rowCount = Math.floor(height / pixelSize)
canvas.width = colCount * pixelSize
canvas.height = rowCount * pixelSize
/**
  * @type CanvasRenderingContext2D
  */
const ctx = canvas.getContext('2d')

let x = 0;
let y = 0;
/**
  * @typedef {{ x: Number, y: Number, active: Boolean }} Pixel
  */

/**
  * @type Array<Pixel>
  */
let pixels = initPixels();

/** 
  * @returns {Array<Pixel>}
  */
function initPixels() {
    const pixels = [];
    for (let x = 0; x < colCount; x++) {
        for (let y = 0; y < rowCount; y++) {
            pixels.push({ x: x * pixelSize, y: y * pixelSize, active: false })
        }
    }

    return pixels
}

function drawGrid() {
    ctx.lineWidth = 1
    for (let y = 0; y < height; y += pixelSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
    }
    for (let x = 0; x < width; x += pixelSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke()
    }
}

function drawPixels() {
    pixels.forEach(({ x, y, active }) => {
        if (active)
            ctx.fillRect(x, y, pixelSize, pixelSize)
    })
}

/**
  * @param {Pixel} px
  */
function pixelIsActive(px) {
    // this makes the program slow...
    // maybe make pixels an object keyed by x:y
    //  - like { "15:45": Pixel }
    const isPixel = pixels.find(p => p.x === px.x && p.y === px.y)
    return isPixel ?
        isPixel.active :
        false
}

/**
  * @param {Pixel} px
  * @returns {Number}
  */
function countNeighbors(px) {
    let ct = 0;
    if (pixelIsActive({ x: px.x - pixelSize, y: px.y })) { // left
        ct++;
    }
    if (pixelIsActive({ x: px.x + pixelSize, y: px.y })) { // right
        ct++;
    }
    if (pixelIsActive({ x: px.x, y: px.y - pixelSize })) { // up
        ct++;
    }
    if (pixelIsActive({ x: px.x, y: px.y + pixelSize })) { // down
        ct++;
    }
    if (pixelIsActive({ x: px.x - pixelSize, y: px.y - pixelSize })) { // up-left
        ct++;
    }
    if (pixelIsActive({ x: px.x + pixelSize, y: px.y - pixelSize })) { // up-right
        ct++;
    }
    if (pixelIsActive({ x: px.x - pixelSize, y: px.y + pixelSize })) { // down-left
        ct++;
    }
    if (pixelIsActive({ x: px.x + pixelSize, y: px.y + pixelSize })) { // down-right
        ct++;
    }
    return ct
}

function init() {
    ctx.clearRect(0, 0, width, height)
    drawGrid();
}

function setNextFrame() {
    // for each pixel:
    //  - if less than 2 neighbors, turn off
    //  - if 2 or 3 neighbors, leave turned on
    //  - if more than 3 neighbors, turn off
    //  - if a dead pixel has 3 neighbors, turn on
    pixels = pixels.map(px => {
        const ct = countNeighbors(px)
        if (px.active) {
            if (ct < 2 || ct > 3) {
                return { ...px, active: false };
            }
            if (ct === 2 || ct === 3) {
                return { ...px, active: true }
            }
        } else {
            if (ct === 3) {
                return { ...px, active: true }
            }
        }
        return px
    })


}

function loop() {
    console.log(gameState)
    if (gameState !== 'stopped') {
        // code here
        init()
        drawPixels();
        if (gameState === 'playing') {
            if (frame % 30 === 0)
                setNextFrame()
        }
        frame = window.requestAnimationFrame(loop)
    } else {
        // clean up
        pixels = initPixels()
        window.cancelAnimationFrame(frame)
    }
}

window.addEventListener('click', (e) => {
    if (gameState !== 'seeding') return

    const { clientX, clientY } = e

    let x = Math.floor(clientX / pixelSize) * pixelSize
    let y = Math.floor(clientY / pixelSize) * pixelSize

    //if (pixelIsActive({ x, y })) {
    pixels = pixels.map(p => {
        if (p.y === y && p.x === x) {
            p.active = !p.active
        }
        return p
    })
})

window.addEventListener('keydown', (e) => {
    e.preventDefault()
    if (e.key === ' ') {
        if (gameState === 'playing') {
            gameState = 'stopped'
        } else if (gameState === 'stopped') {
            gameState = 'seeding'
        } else if (gameState === 'seeding') {
            gameState = 'playing'
        }

        if (gameState !== 'stopped') {
            loop();
        }
    }
    if (e.key === 'ArrowLeft') {
        x -= pixelSize
    } else if (e.key === 'ArrowRight') {
        x += pixelSize
    } else if (e.key === 'ArrowUp') {
        y -= pixelSize
    } else if (e.key === 'ArrowDown') {
        y += pixelSize
    }
    if (x >= colCount * pixelSize) {
        x = 0
    } else if (x < 0) {
        x = (colCount - 1) * pixelSize
    }
    if (y >= rowCount * pixelSize) {
        y = 0
    } else if (y < 0) {
        y = (rowCount - 1) * pixelSize
    }

})

loop()
