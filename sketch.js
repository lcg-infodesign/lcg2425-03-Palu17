let data = [];
let continents = {};
let maxLength = 0;
let maxOutflow = 0;
let totalHeight = 0;
let scrollPosition = 0;
const leftMargin = 140;
const rightMargin = -0;

function preload() {
  loadTable('Dataset.csv', 'header', (table) => {
    for (let row of table.rows) {
      let item = {
        continent: row.getString('continent'),
        name: row.getString('name'),
        outflow: parseFloat(row.getString('outflow')),
        length: row.getNum('length'),
      };
      data.push(item);
      maxLength = max(maxLength, item.length);
      maxOutflow = max(maxOutflow, item.outflow);
      
      continents[item.continent] = continents[item.continent] || [];
      continents[item.continent].push(item);
    }
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateTotalHeight();
}

function draw() {
  if (data.length === 0) return; // caricamento dei dati

  background(240);
  
  const margin = leftMargin + rightMargin;
  const sphereSize = 30;
  const maxLineLength = width - 2 * margin - sphereSize;
  const squareSize = 15;

  push();
  translate(0, -scrollPosition);

  let y = margin;
  for (let continent in continents) {
    let items = continents[continent];
    let centerY = y + (items.length * 30) / 2 + 40;

    // Draw continent sphere
    fill("darkgreen");
    noStroke();
    ellipse(leftMargin + sphereSize / 2, centerY, sphereSize);

    // Draw continent label
    fill(0);
    textAlign(RIGHT, CENTER);
    textSize(16);
    text(continent, max(5, leftMargin - 15), centerY);

    items.forEach((d, i) => {
      let itemY = y + i * 30 + 40;
      let startX = leftMargin + sphereSize;
      let startY = centerY;
      let endX = startX + map(d.length, 0, maxLength, 0, maxLineLength);
      let endY = itemY;
      let controlX = (startX + endX) / 2;

      // curve di bezier
      noFill();
      stroke("lightblue");
      bezier(startX, startY, controlX, startY, controlX, endY, endX, endY);

      // Draw square at the end of the line
      fill("lightblue");
      noStroke();
      rect(endX - squareSize / 2, endY - squareSize / 2, squareSize, squareSize);

      // Draw rectangle
      let rectWidth = map(d.outflow, 0, maxOutflow, 0, min(80, width - rightMargin * 0.15));
      fill(150, 200, 150);
      noStroke();
      rect(endX + squareSize / 2, endY - 10, rectWidth, 20);

      // Draw labels
      fill(0);
      textAlign(LEFT, TOP);
      textSize(12);
      let nameX = endX + squareSize / 2 + 5;
      let nameWidth = width - nameX - margin;
      text(`${d.length} km`, nameX, endY - 10, nameWidth);
      text(d.name, nameX, endY + 1, nameWidth);
      text(`${d.outflow} km³/year`, nameX + rectWidth + 5, endY + 15, nameWidth);
    });

    y += items.length * 30 + 50; // Add space between continent groups
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateTotalHeight();
}

function calculateTotalHeight() {
  totalHeight = Object.values(continents).reduce((acc, items) => acc + items.length * 30 + 50, 0);
  totalHeight += height * 0.2; // aggiunge dello spazietto alla fine
}

function mouseWheel(event) {
  scrollPosition = constrain(scrollPosition + event.delta, 0, max(0, totalHeight - height));
}

