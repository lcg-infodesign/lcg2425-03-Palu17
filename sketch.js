// Array per contenere gli elementi dei dati
let data = [];
// Oggetto per raggruppare gli elementi per continente
let continents = {};
// Variabili per tracciare i valori massimi per la visualizzazione
let maxLength = 0;
let maxOutflow = 0;
// Altezza totale per lo scorrimento
let totalHeight = 0;
// Posizione attuale dello scorrimento
let scrollPosition = 0;
// Margini per il canvas
const leftMargin = 140;
const rightMargin = -0;

function preload() {
  // Carica il file CSV e processa le sue righe
  loadTable('Dataset.csv', 'header', (table) => {
    for (let row of table.rows) {
      // Crea un oggetto item per ogni riga
      let item = {
        continent: row.getString('continent'),
        name: row.getString('name'),
        outflow: parseFloat(row.getString('outflow')),
        length: row.getNum('length'),
      };
      // Aggiungi l'elemento all'array dei dati
      data.push(item);
      // Aggiorna i valori massimi per lunghezza e flusso
      maxLength = max(maxLength, item.length);
      maxOutflow = max(maxOutflow, item.outflow);
      
      // Raggruppa gli elementi per continente
      continents[item.continent] = continents[item.continent] || [];
      continents[item.continent].push(item);
    }
  });
}

function setup() {
  // Crea il canvas con le dimensioni della finestra
  createCanvas(windowWidth, windowHeight);
  // Calcola l'altezza totale per lo scorrimento
  calculateTotalHeight();
}

function draw() {
  // Se non ci sono dati caricati, esci dalla funzione
  if (data.length === 0) return; // Controllo del caricamento dei dati

  // Imposta il colore di sfondo
  background(240);
  
  // Calcola margini e dimensioni per il disegno
  const margin = leftMargin + rightMargin;
  const sphereSize = 30;
  const maxLineLength = width - 2 * margin - sphereSize;
  const squareSize = 15;

  push();
  // Regola la posizione di disegno in base allo scorrimento
  translate(0, -scrollPosition);

  let y = margin;
  // Cicla attraverso ogni continente per disegnare i suoi elementi
  for (let continent in continents) {
    let items = continents[continent];
    // Calcola la posizione centrale Y per il continente
    let centerY = y + (items.length * 30) / 2 + 40;

    // Disegna la sfera che rappresenta il continente
    fill("darkgreen");
    noStroke();
    ellipse(leftMargin + sphereSize / 2, centerY, sphereSize);

    // Disegna l'etichetta del continente
    fill(0);
    textAlign(RIGHT, CENTER);
    textSize(16);
    text(continent, max(5, leftMargin - 15), centerY);

    // Cicla attraverso ogni elemento nel continente
    items.forEach((d, i) => {
      let itemY = y + i * 30 + 40; // Calcola la posizione Y per l'elemento
      let startX = leftMargin + sphereSize; // Posizione X di partenza
      let startY = centerY; // Posizione Y di partenza
      let endX = startX + map(d.length, 0, maxLength, 0, maxLineLength); // Posizione X finale basata sulla lunghezza
      let endY = itemY; // Posizione Y finale
      let controlX = (startX + endX) / 2; // Punto di controllo per la curva Bezier

      // Disegna una curva Bezier
      noFill();
      stroke("lightblue");
      bezier(startX, startY, controlX, startY, controlX, endY, endX, endY);

      // Disegna un quadrato alla fine della linea
      fill("lightblue");
      noStroke();
      rect(endX - squareSize / 2, endY - squareSize / 2, squareSize, squareSize);

      // Disegna un rettangolo che rappresenta il flusso
      let rectWidth = map(d.outflow, 0, maxOutflow, 0, min(80, width - rightMargin * 0.15));
      fill(150, 200, 150);
      noStroke();
      rect(endX + squareSize / 2, endY - 10, rectWidth, 20);

      // Disegna le etichette per l'elemento
      fill(0);
      textAlign(LEFT, TOP);
      textSize(12);
      let nameX = endX + squareSize / 2 + 5;
      let nameWidth = width - nameX - margin;
      text(`${d.length} km`, nameX, endY - 10, nameWidth);
      text(d.name, nameX, endY + 1, nameWidth);
      text(`${d.outflow} km³/year`, nameX + rectWidth + 5, endY + 15, nameWidth);
    });

    y += items.length * 30 + 50; // Aggiungi spazio tra i gruppi di continenti
  }

  pop();
}

function windowResized() {
  // Ridimensiona il canvas quando la finestra cambia dimensione
  resizeCanvas(windowWidth, windowHeight);
  calculateTotalHeight();
}

function calculateTotalHeight() {
  // Calcola l'altezza totale in base agli elementi dei continenti
  totalHeight = Object.values(continents).reduce((acc, items) => acc + items.length * 30 + 50, 0);
  totalHeight += height * 0.2; // Aggiunge dello spazio alla fine
}

function mouseWheel(event) {
  // Regola la posizione di scorrimento in base all'input del mouse
  scrollPosition = constrain(scrollPosition + event.delta, 0, max(0, totalHeight - height));
}