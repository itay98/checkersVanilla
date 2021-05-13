class Draggable {
    constructor(checker, positions) {
        this.checker = checker;
        this.positions = positions;
    }
}
class Position {
    constructor(brown, edible) {
        this.position = brown;
        if (arguments.length > 1)
            this.edible = edible;
        else
            this.edible = "";
    }
}
var browns = document.getElementsByClassName("brown");
var brownFuncs = {
    dragOver: function (e) {
        if (validPos)
            e.preventDefault();
    },
    dragEnter: function () {
        currentPos = currentDrag.positions.find(x => {
            return x.position == this.id;
        });
        if (currentPos != undefined) {
            this.className = "green";
            validPos = true;
        } else
            validPos = false;
    },
    dragLeave: function () {
        this.className = "brown";
    },
    dragDrop: function (e) {
        this.className = "brown";
        if (e.dataTransfer.getData("validDrag")) {
            var c = currentDrag.checker, row = this.id[0];
            this.appendChild(c);
            if ((row == "1" || row == "8") && c.innerText == "") {
                c.innerHTML = "&#9819";
                c.style.animation = "coronation 2s linear";
                setTimeout(() => { c.style.animation = "" }, 2000);
            }
            var eatId = currentPos.edible;
            if (eatId != "") {
                var eaten = document.getElementById(eatId);
                if (eatId[0] == "b") {
                    black.splice(black.indexOf(eaten), 1);
                    if (black.length == 0)
                        endGame("WHITE");
                } else {
                    white.splice(white.indexOf(eaten), 1);
                    if (white.length == 0)
                        endGame("BLACK");
                }
                eaten.remove();
                if (playTurn(c))
                    return;
                setTimeout(() => { c.className = "checker" }, 5);
            }
            turn++;
            isTurnPlayed = true;
        }
    }
}
var turn = 0, draggables = [], white = [], black = [], validPos = false, currentDrag, currentPos, isTurnPlayed = false;
var pieces = document.getElementsByClassName("checker");
for (const piece of pieces) {
    piece.addEventListener("dragstart", dragStart);
    piece.addEventListener("dragend", dragEnd);
    if (piece.id[0] == "b")
        black.push(piece);
    else
        white.push(piece);
}
for (const brown of browns) {
    brown.addEventListener("dragover", brownFuncs.dragOver);
    brown.addEventListener("dragenter", brownFuncs.dragEnter);
    brown.addEventListener("dragleave", brownFuncs.dragLeave);
    brown.addEventListener("drop", brownFuncs.dragDrop);
}
playTurn();

function playTurn(eater) {
    function createPositions(side, rl) {
        if (col != side) {
            var p1 = document.getElementById(row + tb + "" + (col + rl));
            if (p1.childElementCount > 0) {
                var edible = p1.firstElementChild.id;
                if (edible[0] == bw && row != (last - tb) && col != (side - rl) &&
                    document.getElementById(row + 2 * tb + "" + (col + 2 * rl)).childElementCount == 0)
                    pos.push(new Position(row + 2 * tb + "" + (col + 2 * rl), edible));
            } else if (!eater)
                pos.push(new Position(row + tb + "" + (col + rl)));
        }
    }
    for (const immovable of draggables) {
        immovable.checker.setAttribute("draggable", false);
        immovable.checker.className = "checker";
    }
    draggables = [];
    var player, bw, tb, last;
    if (turn % 2 == 0) {
        player = white;
        bw = "b";
        tb = -1;
        last = 1;
    } else {
        player = black;
        bw = "w";
        tb = 1;
        last = 8;
    }
    if (eater != undefined)
        player = [eater];
    for (const checker of player) {
        var brownId = checker.parentElement.id.split("");
        var row = parseInt(brownId[0]);
        var col = parseInt(brownId[1]);
        var pos = [];
        if (row != last) {
            createPositions(1, -1);
            createPositions(8, 1);
        }
        if (checker.innerText != "" && row != (last - tb * 7)) {
            tb = -tb;
            last += tb * 7;
            createPositions(1, -1);
            createPositions(8, 1);
            tb = -tb;
            last += tb * 7;
        }
        if (pos.length > 0)
            draggables.push(new Draggable(checker, pos));
    }
    for (const movable of draggables) {
        movable.checker.setAttribute("draggable", true);
        movable.checker.classList.add("movable");
    }
    return draggables.length != 0;
}
function dragStart(e) {
    this.className = "checker hold";
    setTimeout(() => { this.className = "invisible" }, 10);
    e.dataTransfer.setData("validDrag", true);
    currentDrag = draggables.find(x => {
        return Object.is(x.checker, e.target);
    });
}
function dragEnd() {
    this.className = "checker movable";
    if (isTurnPlayed) {
        isTurnPlayed = false;
        setTimeout(playTurn, 1);
    }
}
function endGame(winner) {
    setTimeout(() => { alert("The " + winner + " won!!") }, 1);
}