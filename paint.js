let board = {
    size: 10,
    width: 50,
    height: 50,
    margin: 3
}
let parameters = {
    number: 10,
    maxIterations: 1000,
    fluctuation: 0.2
}
let beamStart = {
    x: 50,
    y: 50,
}

canvas = document.createElement("canvas")
cxLight = canvas.getContext("2d")
canvas.width = board.size * (board.width + 2 * board.margin)
canvas.height = board.size * (board.height + 2 * board.margin)
cxLight.fillStyle = "yellow"
cxLight.fillRect(0, 0, canvas.width, canvas.height)
// svg.setAttributeNS(null, 'height', board.size * (board.height + 2 * board.margin))
// svg.setAttributeNS(null, 'width', board.size * (board.width + 2 * board.margin))

refIndex = []
// document.body.appendChild(svg)

// for (let i = 0; i < board.height; i++) {
//     refIndex[i] = []
//     for (let j = 0; j < board.width; j++) {
//         refIndex[i][j] = Math.random() * parameters.fluctuation + 1
//         cx.globalAlpha = (refIndex[i][j] - 1) / parameters.fluctuation
//         cx.fillStyle = "gray"
//         cx.fillRect(i * board.size + board.margin * board.size, j * board.size + board.margin * board.size, board.size, board.size)
//         cx.globalAlpha = 1
//         // el = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
//         // el.setAttributeNS(null, 'width', board.size)
//         // el.setAttributeNS(null, 'height', board.size)
//         // el.setAttributeNS(null, 'x', j * board.size + board.margin * board.size)
//         // el.setAttributeNS(null, 'y', i * board.size + board.margin * board.size)
//         // refIndex[i][j] = Math.random() * parameters.fluctuation + 1
//         // el.setAttributeNS(null, 'opacity', (refIndex[i][j] - 1) / parameters.fluctuation)
//         // el.setAttributeNS(null, 'fill', 'gray')
//         // svg.appendChild(el)
//     }
// }
// cx.beginPath()
// cx.lineWidth = "1";
// cx.strokeStyle = "red"
// cx.moveTo(0, 0)
// cx.lineTo(500, 500)
// cx.lineTo(500, 40)
// cx.lineTo(240, 47)
// cx.stroke()


function standardize({ vx, vy }) {
    sum = Math.sqrt(vx * vx + vy * vy)
    return { vx: vx / sum, vy: vy / sum }
}
// position must be with origin at top left cavas's corner
function rayTrace(start, state) {
    let x = state.x / board.size
    let y = state.y / board.size
    let maxIter = state.maxIterations
    let vx = start.vx
    let vy = start.vy
    let i = Math.floor(x)
    let j = Math.floor(y)
    let path = [{ x: x, y: y }]
    let xPrev = 0
    let yPrev = 0
    let jPrev = j
    let iPrev = i
    for (let n = 0; n < maxIter; n++) {
        if (n != 0) {
            if (0 >= i || i >= board.width || 0 >= j || j >= board.height) { break; }
            // console.log("check")
            // console.log(i)
            refRatio = refIndex[i][j] / refIndex[iPrev][jPrev]

            if (i != iPrev) {
                if (Math.abs(vy) > refRatio) {
                    vx = -vx
                    i = iPrev
                }
                else vy = vy * Math.sqrt((1 - vy * vy) / (refRatio * refRatio - vy * vy))
            }
            else if (j != jPrev) {
                if (Math.abs(vx) > refRatio) {
                    vy = - vy
                    j = jPrev
                } else {
                    vx = vx * Math.sqrt((1 - vx * vx) / (refRatio * refRatio - vx * vx))
                }
            }
            newVel = standardize({ vx: vx, vy: vy })
            vx = newVel.vx
            vy = newVel.vy
            // console.log("n works")
        }
        // if (Math.abs(x - xPrev) > 1 || Math.abs(y - yPrev) > 1) { console.log(`x:${x} y:${y}, vx:${vx}, vy:${vy}, i: ${i}, j: ${j},`) }
        xPrev = x
        yPrev = y
        jPrev = j
        iPrev = i
        // console.log("other loop")
        // console.log(i, j)
        if (vx >= 0 && vy >= 0) {
            if (vy * (i + 1 - x) < vx * (j + 1 - y)) {
                y = y + vy * (i + 1 - x) / vx
                x = i + 1
                i++
                // console.log("a")
            } else {
                x = x + vx * (j + 1 - y) / vy
                y = j + 1
                j++
                // console.log("b")
            }
            path.push({ x: x, y: y })
            continue
        }
        else if (vx >= 0 && vy < 0) {
            if (-vy * (i + 1 - x) < vx * (y - j)) {
                y = y + vy * (i + 1 - x) / vx
                x = i + 1
                i++
            }
            else {
                x = x - vx * (y - j) / vy
                y = j
                j--
            }
            path.push({ x: x, y: y })
            continue
        }
        else if (vx < 0 && vy >= 0) {
            if (vy * (x - i) < -vx * (j + 1 - y)) {
                y = y - vy * (x - i) / vx
                x = i
                i--
            }
            else {
                x = x + vx * (j + 1 - y) / vy
                y = j + 1
                j++
            }
            path.push({ x: x, y: y })
            continue
        }
        else if (vx < 0 && vy < 0)
            if (-vy * (x - i) < -vx * (y - j)) {
                y = y - vy * (x - i) / vx
                x = i
                i--
            }
            else {
                x = x - vx * (y - j) / vy
                y = j
                j++
            }
        path.push({ x: x, y: y })
        continue
    }
    return path
}
function rayDraw(res, color, state, cxMain) {
    cxMain.beginPath()
    cxMain.lineWidth = "1";
    cxMain.strokeStyle = color
    let calib = 0
    cxMain.moveTo(state.x + calib, state.y + calib)
    for (pos of res) {
        cxMain.lineTo(pos.x * board.size + calib, pos.y * board.size + calib)
        cxMain.stroke()
    }
}

// console.log(rayTrace(standardize({ vx: 3, vy: 5 }), { maxIterations: 100, x: 200, y: 200 }))

// res = rayTrace(standardize({ vx: 3, vy: 5 }), { maxIterations: 100, x: 200, y: 200 })
// rayDraw(res, "red", { maxIterations: 100, x: 200, y: 200 })

class Picture {
    constructor(width, height, pixels) {
        this.width = width;
        this.height = height;
        this.pixels = pixels;
    }
    static empty(width, height, color, index) {
        let pixels = new Array(width * height).fill(color);
        for (let i = 0; i < board.height; i++) {
            refIndex[i] = []
            for (let j = 0; j < board.width; j++) {
                refIndex[i][j] = index
            }
        }
        return new Picture(width, height, pixels);
    }
    pixel(x, y) {
        return this.pixels[x + y * this.width]
    }
    index(x, y) {
        return refIndex[x][y]
    }
    draw(pixels) {
        let copy = this.pixels.slice();
        for (let { x, y, color } of pixels) {
            copy[x + y * this.width] = color;
        }
        return new Picture(this.width, this.height, copy);
    }
}
function updateState(state, action) {
    return Object.assign({}, state, action);
}

function elt(type, props, ...children) {
    let dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    for (let child of children) {
        if (typeof child != "string") dom.appendChild(child);
        else dom.appendChild(document.createTextNode(child))
    }
    return dom;
}

const scale = board.size

class PictureCanvas {
    constructor(picture, pointerDown) {
        this.dom = elt("canvas",
            {
                onmousedown: event => this.mouse(event, pointerDown),
                ontouchstart: event => this.touch(event, pointerDown)
            });
        this.syncState(picture)
    }
    syncState(picture) {
        if (this.picture == picture) return;
        this.picture = picture;
        drawPicture(this.picture, this.dom, scale);
    }
}

function drawPicture(picture, canvas, scale) {
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    let cx = canvas.getContext("2d")

    for (let y = 0; y < picture.height; y++) {
        for (let x = 0; x < picture.width; x++) {
            // if (fluct != 0) {
            //     cx.fillStyle = picture.pixel(x, y)
            // }
            cx.fillStyle = picture.pixel(x, y);
            cx.fillRect(x * scale, y * scale, scale, scale)
            cxLight.fillStyle = "yellow"
            cxLight.fillRect(x * scale, y * scale, board.size, board.size)
            cxLight.globalAlpha = refIndex[x][y] - 1
            cxLight.fillStyle = "gray"
            cxLight.fillRect(x * scale, y * scale, board.size, board.size)
            cxLight.globalAlpha = 1
        }
    }
    test = rayTrace(standardize({ vx: 3, vy: 5 }), { maxIterations: 100, x: 200, y: 200 })
    rayDraw(test, "red", { maxIterations: 100, x: 200, y: 200 }, cx)
}

PictureCanvas.prototype.mouse = function (downEvent, onDown) {
    if (downEvent.button != 0) return;
    let pos = pointerPosition(downEvent, this.dom);
    let onMove = onDown(pos);
    if (!onMove) return;
    let move = moveEvent => {
        if (moveEvent.buttons == 0) {
            this.dom.removeEventListener("mousemove", move);
        } else {
            let newPos = pointerPosition(moveEvent, this.dom);
            if (newPos.x == pos.x && newPos.y == pos.y) return;
            pos = newPos;
            onMove(newPos);
        }
    }
    this.dom.addEventListener("mousemove", move)
}

function pointerPosition(pos, domNode) {
    let rect = domNode.getBoundingClientRect();
    return {
        x: Math.floor((pos.clientX - rect.left) / scale),
        y: Math.floor((pos.clientY - rect.top) / scale)
    }
}
PictureCanvas.prototype.touch = function (startEvent, onDown) {
    let pos = pointerPosition(startEvent.touches[0], this.dom);
    let onMove = onDown(pos);
    startEvent.preventDefault();
    if (!onMove) return;
    let move = moveEvent => {
        let newPos = pointerPosition(moveEvent.touches[0], this.dom);
        if (newPos.x == pos.x && newPos.y == pos.y) return;
        pos = newPos;
        onMove(newPos);
    };
    let end = () => {
        this.dom.removeEventListener("touchmove", move);
        this.dom.removeEventListener("touchend", end);
    };
    this.dom.addEventListener("touchmove", move);
    this.dom.addEventListener("touchend", end);
};

class PixelEditor {
    constructor(state, config) {
        let { tools, controls, dispatch } = config
        this.state = state;

        this.canvas = new PictureCanvas(state.picture, pos => {
            let tool = tools[this.state.tool];
            let onMove = tool(pos, this.state, dispatch);
            if (onMove) return pos => onMove(pos, this.state);
        });
        this.controls = controls.map(
            Control => new Control(state, config));
        this.dom = elt("div", {}, this.canvas.dom, elt("br"),
            ...this.controls.reduce(
                (a, c) => a.concat(" ", c.dom), []));
    }
    syncState(state) {
        this.state = state;
        this.canvas.syncState(state.picture);
        for (let ctrl of this.controls) ctrl.syncState(state);
    }
}
class ToolSelect {
    constructor(state, { tools, dispatch }) {
        this.select = elt("select", {
            onchange: () => dispatch({ tool: this.select.value })
        }, ...Object.keys(tools).map(name => elt("option", {
            selected: name == state.tool
        }, name)));
        this.dom = elt("label", null, "Drawing Tool: ", this.select)
    }
    syncState(state) { this.select.value = state.tool }
}

class ColorSelect {
    constructor(state, { dispatch }) {
        this.input = elt("input", {
            type: "color",
            value: state.color,
            onchange: () => dispatch({ color: this.input.value })
        });
        this.dom = elt("label", null, "Colour Selector: ", this.input);
    }
    syncState(state) { this.input.value = state.color; }
}

class IndexSelect {
    constructor(state, { dispatch }) {
        this.input = elt("input", {
            type: "range",
            // value: state.index,
            min: 1,
            max: 2,
            value: 1.2,
            step: 0.1,
            onchange: () => dispatch({ index: this.input.value })
        });
        this.dom = elt("label", null, "Index Selector: ", this.input);
    }
    syncState(state) { this.input.value = state.index; }
}

// class IndexPrev {
//     constructor(state, { dispatch }) {
//         this.button = elt("button", {
//             onclick: () => dispatch({ index: this.input.value })
//         });
//         this.dom = elt("label", null, "Index Selector: ", this.button);
//     }
//     syncState(state) { this.input.value = state.index; }
// }


function draw(pos, state, dispatch) {
    function drawPixel({ x, y }, state) {
        let drawn = { x, y, color: state.color };
        dispatch({ picture: state.picture.draw([drawn]) });
    }
    drawPixel(pos, state);
    return drawPixel;
}
function drawIndex(pos, state, dispatch) {
    function drawPixel({ x, y }, state) {
        let drawn = { x, y, color: state.color };
        refIndex[x][y] = state.index
        // console.log(parseFloat(state.index))
        dispatch({ picture: state.picture.draw([drawn]) });
    }
    drawPixel(pos, state);
    return drawPixel;
}
function rectangle(start, state, dispatch) {
    function drawRectangle(pos) {
        let xStart = Math.min(start.x, pos.x);
        let yStart = Math.min(start.y, pos.y);
        let xEnd = Math.max(start.x, pos.x);
        let yEnd = Math.max(start.y, pos.y);
        let drawn = [];
        console.log(xStart)
        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                drawn.push({ x, y, color: state.color })
            }
        }
        dispatch({ picture: state.picture.draw(drawn) });
    }
    drawRectangle(start);
    return drawRectangle;
}
const around = [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }];

function fill({ x, y }, state, dispatch) {
    let targetColor = state.picture.pixel(x, y);
    let drawn = [{ x, y, color: state.color }];
    for (let done = 0; done < drawn.length; done++) {
        for (let { dx, dy } of around) {
            let x = drawn[done].x + dx, y = drawn[done].y + dy;
            if (x >= 0 &&
                x < state.picture.width &&
                y >= 0 &&
                y < state.picture.height &&
                state.picture.pixel(x, y) == targetColor &&
                !drawn.some(p => p.x == x && p.y == y)) {
                drawn.push({ x, y, color: state.color });
            }
        }
    }
    dispatch({ picture: state.picture.draw(drawn) });
}


// function fillIndex({ x, y }, state, dispatch) {
//     let targetColor = state.picture.pixel(x, y);
//     let drawn = [{ x, y, color: state.color }];
//     for (let done = 0; done < drawn.length; done++) {
//         for (let { dx, dy } of around) {
//             let x = drawn[done].x + dx, y = drawn[done].y + dy;
//             if (x >= 0 &&
//                 x < state.picture.width &&
//                 y >= 0 &&
//                 y < state.picture.height &&
//                 state.picture.pixel(x, y) == targetColor &&
//                 !drawn.some(p => p.x == x && p.y == y)) {
//                 drawn.push({ x, y, color: state.color });
//             }
//         }
//     }
//     dispatch({ picture: state.picture.draw(drawn) });
// }

function pick(pos, state, dispatch) {
    dispatch({ color: state.picture.pixel(pos.x, pos.y) });
}


let state = {
    tool: "draw",
    color: "#000000",
    picture: Picture.empty(board.width, board.height, "#f0f0f0", 1),
    index: 1
};
let app = new PixelEditor(state, {
    tools: { draw, fill, rectangle, pick, drawIndex },
    controls: [ToolSelect, ColorSelect, IndexSelect],
    dispatch(action) {
        state = updateState(state, action);
        app.syncState(state);
    }
});
document.body.appendChild(document.createElement("div")).appendChild(app.dom)
document.querySelector("div").appendChild(canvas)

function drawIndexMap(picture, canvas, scale) {
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    let cx = canvas.getContext("2d")
    for (let y = 0; y < picture.height; y++) {
        for (let x = 0; x < picture.width; x++) {
            // if (fluct != 0) {
            //     cx.fillStyle = picture.pixel(x, y)
            // }
            cx.fillStyle = "white"
            cx.fillRect(x * scale, y * scale, board.size, board.size)
            cx.globalAlpha = refIndex[x][y] - 1
            cx.fillStyle = "gray"
            cx.fillRect(x * scale, y * scale, board.size, board.size)
            cx.globalAlpha = 1
        }
    }
    test = rayTrace(standardize({ vx: 3, vy: 5 }), { maxIterations: 100, x: 200, y: 200 })
    rayDraw(test, "red", { maxIterations: 100, x: 200, y: 200 }, cx)
}

preview = document.createElement("BUTTON")
// // console.log(document.getElementById("btn"))
// // startRay = document.getElementById("btn")
preview.innerHTML = "Check your index of refraction"

function starter() {
 drawIndexMap(state.picture, app.canvas.dom, scale) 
}
preview.addEventListener("click", starter)
document.body.appendChild(preview)
