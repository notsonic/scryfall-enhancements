// Scryfall Enhancements scryfall.js
// A Chrome extension for adding additional format legailites
// to Scryfall.com.

/*jslint devel: true */
/*jslint browser: true */

// Object mapping legalities, their text labels, and css classes.
var legalities = {
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
var overrides = {
    heritage: {
        // Candelabra of Tawnos
        "c7c7bffa-442d-4ba5-b778-ad394c192f27": "legal"
    }
};

// HTML to insert into the page.
var tableHtml = `
<div class="card-legality-row">
    <div id="premodern-legality" class="card-legality-item">
        <dt>Premodern</dt>
        <dd class="not-legal">Loading</dd>
    </div>
    <div id="heritage-legality" class="card-legality-item">
        <dt>Heritage</dt>
        <dd class="not-legal">Loading</dd>
    </div>
</div>
`;

// Id and Name of the current card.
var cardId = document.querySelector("meta[name=\"scryfall:card:id\"]")?.content;
var cardName = document.querySelector("meta[property=\"og:title\"]")?.content;
var oracleId = document
    .querySelector("meta[name=\"scryfall:oracle:id\"]")
    ?.content;

// Insert the table HTML into the page.
function renderHTML() {
    document
        .querySelector("#main .card-legality")
        .insertAdjacentHTML("beforeEnd", tableHtml);
}

// Helper function to update an element to a specified legality.
function setLegality(elem, legality) {
    elem.innerHTML = legalities[legality].label;
    elem.classList.replace("not-legal", legalities[legality].class);
}

// Handle a format that scryfall has legality information for
// but does not display by default.
async function handleKnownFormat(elem, format) {
    var cardURL = `https://api.scryfall.com/cards/${cardId}`;
    var response = await fetch(cardURL);
    var json = await response.json();
    var legality = json.legalities[format];

    setLegality(elem, legality);
}

// Handle the heritage format via custom search query and exception lookup.
async function handleHeritage(elem) {
    var query;
    var queryEncoded;
    var searchURL;
    var response;
    var jsonResponse;
    var cardData;

    if (overrides.heritage[oracleId]) {
        setLegality(elem, overrides.heritage[oracleId]);
        return;
    }

    query = [
        `oracleid:${oracleId}`,
        "(st:core OR st:expansion)",
        "-atag:external-ip"
    ].join(" AND ");
    queryEncoded = encodeURI(query);
    searchURL = `https://api.scryfall.com/cards/search?q=${queryEncoded}`;

    response = await fetch(searchURL);
    if (response.status === 404) {
        setLegality(elem, "not_legal");
        return;
    }

    if (response.status !== 200) {
        setLegality(elem, undefined);
        return;
    }

    jsonResponse = await response.json();
    if (jsonResponse?.total_cards !== 1) {
        setLegality(elem, undefined);
        return;
    }

    cardData = jsonResponse?.data?.[0];
    setLegality(elem, cardData?.legalities?.legacy);
}

// Main function.
function main() {
    var premodernElement;
    var heritageElement;

    // Say hi.
    console.log("hello. scryfall enhancements v0.2.");

    // Don't do anything if we're not looking at a single card.
    if (
        cardId === undefined ||
        cardName === undefined ||
        oracleId === undefined
    ) {
        return;
    }

    // Insert the placeholder HTML.
    renderHTML();

    // Fetch Premodern legality.
    premodernElement = document.querySelector("#premodern-legality dd");
    handleKnownFormat(premodernElement, "premodern");

    // Fetch Heritage legality.
    heritageElement = document.querySelector("#heritage-legality dd");
    handleHeritage(heritageElement);
}
main();
