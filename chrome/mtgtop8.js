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

// HTML for the threat header cell.
const threatHeaderHtml = `
<td class="S14" align="center" title="Threat Level">
    Threat
</td>
`;

// HTML for the threat value table cell.
const threatCellHtml = (vars) => `
<td id="${vars.rowId}_4" class="L14" align="right" title="Blechmans">
    ${vars.threatLevel}
</td>
`;

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
    var tableElement;

    // Say hi.
    console.log("hello. mtgtop8 enhancements v0.2.");

    // Get the table of cards.
    tableElement = document.querySelector(tableSelector);

    // Iterate over the rows adding a new column for Threat Level.
    for (const row of tableElement.rows) {
        if (row.rowIndex === 0) {
            // Add the header cell.
            row.insertAdjacentHTML("beforeEnd", threatHeaderHtml);
        } else {
            // Add the per card threat level cell.
            row.insertAdjacentHTML(
                "beforeEnd",
                threatCellHtml({
                    "rowId": row.id,
                    "threatLevel": calculateThreatLevel(row)
                })
            );
        }
    }
}
main();
