// Scryfall Enhancements mtgtop8.js
// A Chrome extension for adding additional info
// to mtgtop8.com

/*jslint devel: true */
/*jslint browser: true */

// Is this reliable? Can it be improved? MTGTop8 uses very few IDs.
const tableSelector = [
    "body",
    "div.page",
    "div",
    "table",
    "tbody",
    "tr:nth-child(2)",
    "td",
    "table",
    "tbody",
    "tr:nth-child(3)",
    "td:nth-child(1)",
    "table",
    "tbody"
].join(" > ");

// Calculate the threat level for a given row
// Threat is the percentage of decks a card is in multiplied
// by the number of copies. Round to 2 decimals to keep it clean.
function calculateThreatLevel(row) {
    var decksPercentage = parseFloat(row.cells[1].textContent);
    var copiesPerDeck = parseFloat(row.cells[2].textContent);
    var threatLevelRaw = decksPercentage * copiesPerDeck;
    return threatLevelRaw.toFixed(2);
}

// Main function.
function main() {
    // Say hi.
    const manifest = browser.runtime.getManifest();
    console.log(`hello. mtgtop8 enhancements v${manifest.version}.`);

    // Get the table of cards.
    const tableElement = document.querySelector(tableSelector);

    // New element for the threat header cell.
    const threatHeaderElement = document.createElement("td");
    threatHeaderElement.className = "S14";
    threatHeaderElement.setAttribute("align", "center");
    threatHeaderElement.setAttribute("title", "Threat Level");
    threatHeaderElement.textContent = "Threat";

    // New element for a threat value table cell.
    const threatCellElement = document.createElement("td");
    threatCellElement.className = "L14";
    threatCellElement.setAttribute("align", "right");
    threatCellElement.setAttribute("title", "Blechmans");

    // Iterate over the rows adding a new column for Threat Level.
    for (const row of tableElement.rows) {
        if (row.rowIndex === 0) {
            // Add the header cell.
            row.appendChild(threatHeaderElement);
        } else {
            // Add the per card threat level cell.
            const newCell = threatCellElement.cloneNode(false);
            newCell.id = `${row.id}_4`;
            newCell.textContent = calculateThreatLevel(row);
            row.appendChild(newCell);
        }
    }
}
main();
