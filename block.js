var objects = [];
var moves = [];
const reader = new FileReader();
let contents = [];
let levelSize = [];
let levelData = [];

function loadLevel(input) {
  let file = input.files[0];
  objects.length = 0;
  reader.readAsText(file);
  reader.onload = () => contents = reader.result.split("\n");
  reader.onloadend = () => {
    document.getElementById("level-name").innerHTML = contents[0];
    document.getElementById("level-author").innerHTML = contents[1];
    levelSize = contents[2].split(",");
    levelData = contents[3].split(",");
    let x = 1, y = 1, blockData = 0;
    while(y <= levelSize[1]) {
      for(x = 1; x <= levelSize[0]; x++) {
        let block = new Block(x, y, levelData[blockData]);
        blockData++;
      }
      y++;
    }
    objects.sort(function(a,b) {
      return a.type - b.type;
    });
    displayLevel();
    document.getElementById("bgm").play();
    document.addEventListener("keydown", keyPress);
  };
}

function keyPress(event) {
  switch(event.which) {
    // MOVE LEFT
    case 37:
      moves.push(JSON.parse(JSON.stringify(objects)));
      moveBlock(-1,0);
      break;
    // MOVE UP
    case 38:
      moves.push(JSON.parse(JSON.stringify(objects)));
      moveBlock(0,-1);
      break;
    // MOVE RIGHT
    case 39:
      moves.push(JSON.parse(JSON.stringify(objects)));
      moveBlock(1,0);
      break;
    // MOVE DOWN
    case 40:
      moves.push(JSON.parse(JSON.stringify(objects)));
      moveBlock(0,1);
      break;
  }
}

function displayLevel() {
  let x = 1, y = 1;
  let canvas = document.getElementById("my-canvas");
  canvas.width = 64 * levelSize[0];
  canvas.height = 64 * levelSize[1];
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0, canvas.width, canvas.height);
  while (y <= levelSize[1]) {
    for (x = 1; x <= levelSize[0]; x++) {
      ctx.drawImage(document.getElementById("0"), 64 * x - 64, 64 * y - 64);
    }
    y++;
  }
  objects.forEach(function(item, index) {
    ctx.drawImage(document.getElementById(item.type), 64 * item.xPos - 64, 64 * item.yPos - 64);
  });
  checkPress();
  if (checkWin()) {
    document.removeEventListener("keydown", keyPress);
    document.getElementById("bgm").pause();
    document.getElementById("win").play();
    document.getElementById("undo-button").disabled = true;
    document.getElementById("file-level").disabled = true;
    document.getElementById("my-canvas").style.opacity = 0.5;
  }
}

function checkPress() {
  for (let i = objects.length - 2; i >= 0; i--) {
    if (objects[i].type === 2) {
      for (let j = objects.length - 2; j >= 0; j--) {
        if (objects[j].type === 4) {
          if (objects[i].xPos === objects[j].xPos && objects[i].yPos === objects[j].yPos) {
            objects[i].pressed = true;
            break;
          }
        }
        objects[i].pressed = false;
      }
    }
  }
}

function checkWin() {
  for (let i = objects.length - 2; i >= 0; i--) {
    if (objects[i].type === 2 && objects[i].pressed === false) {
      return false;
    }
  }
  return true;
}

function moveBlock(x,y, block) {
  if (block) {
    for (let i = objects.length -2; i >= 0; i--) {
      // If the block's projected movement is the same as another object
      if (objects[i].xPos == block.xPos + x && objects[i].yPos == block.yPos + y) {
        // If the object in its path isn't passable
        if (objects[i].passable == false || objects[i].movable == true) {
          return false;
          // If it IS passable
        } else {
          block.xPos += x;
          block.yPos += y;
          return true;
        }
      }
    }
    return false;
  } else {
    for (let i = objects.length -2; i >= 0; i--) {
      // If the player's projected movement is the same as another object
      if (objects[i].xPos == objects[objects.length - 1].xPos + x && objects[i].yPos == objects[objects.length - 1].yPos + y) {
        if (objects[i].passable == false && objects[i].movable == false) {
          break;
        }
        else if (objects[i].passable == false && objects[i].movable == true) {
          let moved = moveBlock(x,y, objects[i]);
          if (moved === false) {
            break;
          }

        }
        else {
          objects[objects.length - 1].xPos += x;
          objects[objects.length - 1].yPos += y;
          break;
        }
      }
    }
  }
  displayLevel();
}

function undo() {
  if (moves.length > 0) {
    objects = moves.pop();
    displayLevel();
  } else alert("No more moves to undo.");
}

class Block {
  constructor(xPos, yPos, type) {
      this.xPos = xPos;
      this.yPos = yPos;
      this.type = parseInt(type);
      this.movable = null;
      this.passable = null;

      if (this.type === 4 || this.type === 8) {
        let walkable = new Block(this.xPos, this.yPos, "0");
      }

    switch(this.type) {
      //Walkable block
      case 0:
        this.movable = false;
        this.passable = true;
        break;
      //Wall block
      case 1:
        this.movable = false;
        this.passable = false;
        break;
      //Button block
      case 2:
        this.movable = false;
        this.passable = true;
        this.pressed = false;
        break;
      //Wall & Button
      case 3:
        let newBlock = new Block(this.xPos, this.yPos, "1");
        this.type = 2;
        this.movable = false;
        this.passable = true;
        this.pressed = false;
        break;
      //Block block
      case 4:
        this.movable = true;
        this.passable = false;
        break;
      //Wall & Block
      case 5:
        let newBlock2 = new Block(this.xPos, this.yPos, "1");
        this.type = 4;
        this.movable = true;
        this.passable = false;
        break;
      //Button & Block
      case 6:
        let newBlock3 = new Block(this.xPos, this.yPos, "2");
        this.type = 4;
        this.movable = true;
        this.passable = false;
        break;
      //Wall, Button & Block
      case 7:
        let newBlock4 = new Block(this.xPos, this.yPos, "3");
        this.type = 4;
        this.movable = true;
        this.passable = false;
        break;
      //Player block
      case 8:
        this.movable = true;
        this.passable = false;
        break;
      //Wall & Player
      case 9:
        let newBlock5 = new Block(this.xPos, this.yPos, "1");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Button & Player
      case 10:
        let newBlock6 = new Block(this.xPos, this.yPos, "2");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Wall, Button & Player
      case 11:
        let newBlock7 = new Block(this.xPos, this.yPos, "3");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Block & Player
      case 12:
        let newBlock8 = new Block(this.xPos, this.yPos, "4");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Wall, Block & Player
      case 13:
        let newBlock9 = new Block(this.xPos, this.yPos, "5");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Button, Block & Player
      case 14:
        let newBlockA = new Block(this.xPos, this.yPos, "6");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
      //Wall, Button, Block & Player
      case 15:
        let newBlockB = new Block(this.xPos, this.yPos, "7");
        this.type = 8;
        this.movable = true;
        this.passable = false;
        break;
    }
    objects.push(this);
  }
}
