// Variabili e costanti globali
let menuInizialeImg;
let immaginePausa;
let giocatore;
let img;
let statoGioco = 0;
let razzoImg;
let razzo2Img;
let autoNemicaImg;
let esplosioneGif;
let autoDistruttaImg;
let razzi = [];
let razzi2 = [];
let autoNemiche = [];
let punteggio = 0;
let sfondoImg;
let y1 = 0;
let y2;
let velocitàScorrimento = 2;
let inPausa = false;
let bottoneRiprendi, bottoneRigioca, bottoneEsci;
let timerDistruttività = 20;
let imgBase;

// Caricamento delle immagini
function preload() {
  menuInizialeImg = loadImage('./img/1.png');
  immaginePausa = loadImage('./img/pausa.png');
  img = loadImage('./img/tankblu.png');
  sfondoImg = loadImage('./img/road2.jpg');
  razzoImg = loadImage("./img/missile.png");
  razzo2Img = loadImage("./img/missilenemico.png");
  autoNemicaImg = loadImage("./img/tankverde.png");
  esplosioneGif = loadImage("./img/fumo1.gif");
  autoDistruttaImg = loadImage("./img/fumo1.gif");
  imgBase = autoNemicaImg;
}

// Impostazioni iniziali del gioco
function setup() {
  createCanvas(1890, 926);
  giocatore = new Giocatore();
  y2 = height;
  setInterval(function() {
    for (let j = 0; j < 7; j++) {
      autoNemiche.push(creaAutoNemica());
    }
  }, 5000);
}

// Disegno del gioco
function draw() {
  switch (statoGioco) {
    case 0:
      background(menuInizialeImg);
      break;
    case 1:
      if (!inPausa) {
        background(sfondoImg);
        image(sfondoImg, 0, y2, width, height);
        image(sfondoImg, 0, y1, width, height);
        y1 += velocitàScorrimento;
        y2 += velocitàScorrimento;
        if (y1 > height) {
          y1 = -height;
        }
        if (y2 > height) {
          y2 = -height;
        }
        for (let i = autoNemiche.length - 1; i >= 0; i--) {
          autoNemiche[i].move();
          autoNemiche[i].display();
          if (autoNemiche[i].y > height) {
            autoNemiche.splice(i, 1);
          } else {
            if (autoNemiche[i].colpisce(giocatore)) {
              if (!autoNemiche[i].haColpitoGiocatore) {
                punteggio -= 1;
                autoNemiche[i].haColpitoGiocatore = true;
              }
            }
            if (autoNemiche[i].checkEsploso()) {
              image(esplosioneGif, autoNemiche[i].x, autoNemiche[i].y, autoNemiche[i].larghezza, autoNemiche[i].altezza);
              setTimeout(() => {
                autoNemiche.splice(i, 1);
              }, 500);
            }
          }
        }
        for (let i = razzi.length - 1; i >= 0; i--) {
          razzi[i].move();
          razzi[i].display();
          for (let j = autoNemiche.length - 1; j >= 0; j--) {
            if (razzi[i].colpisce(autoNemiche[j])) {
              autoNemiche[j].esploso = true;
              razzi.splice(i, 1);
              punteggio += 1;
              break;
            }
          }
        }
        for (let i = razzi2.length - 1; i >= 0; i--) {
          razzi2[i].move();
          razzi2[i].display();
          if (razzi2[i].colpisce(giocatore)) {
            punteggio -= 1;
            razzi2.splice(i, 1);
          }
        }
        giocatore.move();
        giocatore.display();
        fill(255);
        textSize(32);
        text("Punteggio: " + punteggio, 100, 30);
        if (punteggio >= 50 || punteggio <= -25) {
          fineGioco();
        }
      } else {
        image(immaginePausa, 0, 0, width, height);
      }
      break;
    case 2:
      background(immaginePausa);
      break;
  }
}

// Gestione degli input
function keyPressed() {
  if (keyCode === ENTER) {
    razzi.push(new Razzo(giocatore.x - 12, giocatore.y - 15));
  } else if (keyCode === ESCAPE) {
    cambiaPausa();
  } else if (keyCode === 49) {
    iniziaLivello(1);
  } else if (keyCode === 50) {
    iniziaLivello(2);
  } else if (keyCode === 51) {
    iniziaLivello(3);
  } else if (keyCode === 84) {
    statoGioco = 0;
    rigioca();
  }
}

// Funzione per mettere in pausa/riprendere il gioco
function cambiaPausa() {
  if (statoGioco === 1) {
    inPausa = !inPausa;
    if (inPausa) {
      image(immaginePausa, 0, 0, width, height);
    }
  }
}

// Funzione per avviare il gioco con il livello selezionato
function iniziaLivello(livello) {
  statoGioco = livello;
  punteggio = 0;
  autoNemiche = [];
  razzi = [];
  giocatore = new Giocatore();
}

// Funzione per rigiocare
function rigioca() {
  punteggio = 0;
  autoNemiche = [];
  razzi = [];
  statoGioco = 1;
}

// Funzione per terminare il gioco
function fineGioco() {
  statoGioco = 2;
}

// Funzione per creare un'auto nemica
function creaAutoNemica() {
  return new AutoNemica(random(width), -100, random(2, 5), random(1, 3), imgBase);
}

// Classe Giocatore
class Giocatore {
  constructor() {
    this.x = width / 2;
    this.y = height - 60;
    this.larghezza = 100;
    this.altezza = 80;
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 5;
    }
    if (this.x <= 0) {
      this.x = 0;
    }
    if (this.x >= width - 100) {
      this.x = width - 100;
    }
  }

  display() {
    image(img, this.x, this.y, this.larghezza, this.altezza);
  }
}

// Classe Razzo
class Razzo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.larghezza = 20;
    this.altezza = 40;
  }

  move() {
    this.y -= 5;
  }

  display() {
    image(razzoImg, this.x, this.y, this.larghezza, this.altezza);
  }

  colpisce(autoNemica) {
    let d = dist(this.x + this.larghezza / 2, this.y + this.altezza / 2, autoNemica.x + autoNemica.larghezza / 2, autoNemica.y + autoNemica.altezza / 2);
    if (d < this.larghezza / 2 + autoNemica.larghezza / 2 && d < this.altezza / 2 + autoNemica.altezza / 2) {
      return true;
    }
    return false;
  }
}

// Classe AutoNemica
class AutoNemica {
  constructor(x, y, velocitàX, velocitàY, img) {
    this.x = x;
    this.y = y;
    this.velocitàX = velocitàX;
    this.velocitàY = velocitàY;
    this.larghezza = 100;
    this.altezza = 80;
    this.img = img;
    this.haColpitoGiocatore = false;
    this.esploso = false;
  }

  move() {
    this.y += this.velocitàY;
  }

  display() {
    image(this.img, this.x, this.y, this.larghezza, this.altezza);
  }

  colpisce(giocatore) {
    let d = dist(this.x + this.larghezza / 2, this.y + this.altezza / 2, giocatore.x + giocatore.larghezza / 2, giocatore.y + giocatore.altezza / 2);
    if (d < this.larghezza / 2 + giocatore.larghezza / 2 && d < this.altezza / 2 + giocatore.altezza / 2) {
      return true;
    }
    return false;
  }

  checkEsploso() {
    return this.esploso;
  }
}
