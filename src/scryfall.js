// Scryfall Enhancements scryfall.js
// A Chrome extension for adding additional format legailites
// to Scryfall.com.

/*jslint devel: true */
/*jslint browser: true */
/*global browser */

// Object mapping legalities, their text labels, and css classes.
const legalities = {
    banned: {
        class: "banned",
        label: "Banned"
    },
    legal: {
        class: "legal",
        label: "Legal"
    },
    not_legal: {
        class: "not-legal",
        label: "Not Legal"
    },
    restricted: {
        class: "restricted",
        label: "Restrict."
    },
    undefined: {
        class: "not-legal",
        label: "Error"
    }
};

// Card legality overrides to handle edge cases where scryfall doesn't have
// all the answers we need. Lookup by Oracle Id to handle every print
// and language.
const overrides = {
    heritage: {
        // Candelabra of Tawnos
        "c7c7bffa-442d-4ba5-b778-ad394c192f27": "legal"
    }
};

// ID, Name, and Oracle ID of the current card.
const cardSelector = "meta[name=\"scryfall:card:id\"]";
const cardId = document.querySelector(cardSelector)?.content;

const nameSelector = "meta[property=\"og:title\"]";
const cardName = document.querySelector(nameSelector)?.content;

const oracleSelector = "meta[name=\"scryfall:oracle:id\"]";
const oracleId = document.querySelector(oracleSelector)?.content;

// Insert the table HTML into the page.
function createNewTableElements(formats) {
    // Create a cell for each format requested.
    const legalityCells = [];
    for (const format of formats) {
        const legalityCell = document.createElement("div");
        legalityCell.id = `${format.label}-legality`;
        legalityCell.className = "card-legality-item";
        const legalityTerm = document.createElement("dt");
        legalityTerm.textContent = format.name;
        const legalityDetails = document.createElement("dd");
        legalityDetails.className = "not-legal";
        legalityDetails.textContent = "Loading";

        legalityCell.appendChild(legalityTerm);
        legalityCell.appendChild(legalityDetails);

        legalityCells.push(legalityCell);
    }

    // Create a new row and add the cells, 2 at a time.
    for (let i = 0; i < legalityCells.length; i += 2) {
        const legalityRow = document.createElement("div");
        legalityRow.className = "card-legality-row";
        legalityRow.appendChild(legalityCells[i]);
        if (i + 1 < legalityCells.length) {
            legalityRow.appendChild(legalityCells[i + 1]);
        }

        document
            .querySelector("#main .card-legality")
            .appendChild(legalityRow);
    }
}

// Helper function to update an element to a specified legality.
function setLegality(elem, legality) {
    elem.textContent = legalities[legality].label;
    elem.classList.replace("not-legal", legalities[legality].class);
}

// Handle a format that scryfall has legality information for
// but does not display by default.
async function handleKnownFormat(elem, format) {
    const cardURL = `https://api.scryfall.com/cards/${cardId}`;
    const response = await fetch(cardURL);
    const json = await response.json();
    const legality = json.legalities[format];

    setLegality(elem, legality);
}

// Handle the heritage format via custom search query and exception lookup.
async function handleHeritage(elem) {
    if (overrides.heritage[oracleId]) {
        setLegality(elem, overrides.heritage[oracleId]);
        return;
    }

    const query = [
        `oracleid:${oracleId}`,
        "(st:core OR st:expansion)",
        "-atag:external-ip"
    ].join(" AND ");
    const queryEncoded = encodeURI(query);
    const searchURL = `https://api.scryfall.com/cards/search?q=${queryEncoded}`;

    const response = await fetch(searchURL);
    if (response.status === 404) {
        setLegality(elem, "not_legal");
        return;
    }

    if (response.status !== 200) {
        setLegality(elem, undefined);
        return;
    }

    const jsonResponse = await response.json();
    if (jsonResponse?.total_cards !== 1) {
        setLegality(elem, undefined);
        return;
    }

    const cardData = jsonResponse?.data?.[0];
    setLegality(elem, cardData?.legalities?.legacy);
}

// Main function.
function main() {
    // Say hi.
    const manifest = browser.runtime.getManifest();
    console.log(`hello. scryfall enhancements v${manifest.version}.`);

    // Don't do anything if we're not looking at a single card.
    if (
        cardId === undefined ||
        cardName === undefined ||
        oracleId === undefined
    ) {
        return;
    }

    // Create new placeholder element and insert it into the dom.
    createNewTableElements([
        {label: "premodern", name: "Premodern"},
        {label: "heritage", name: "Heritage"}
    ]);

    // Fetch Premodern legality.
    const premodernElement = document.querySelector("#premodern-legality dd");
    handleKnownFormat(premodernElement, "premodern");

    // Fetch Heritage legality.
    const heritageElement = document.querySelector("#heritage-legality dd");
    handleHeritage(heritageElement);
}
main();
