// Scryfall Enhancements scryfall.js
// A Chrome extension for adding additional format legailites
// to Scryfall.com.

/*jslint devel: true */
/*jslint browser: true */
/*jslint unordered: true */
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

// Object mapping formats, their display names, and handlers.
const supported_formats = {
    classic: {
        handler: handleTypicalFormat,
        name: "Classic Legacy",
        query: [
            "legal:legacy",
            "date<=roe"
        ].join(" AND ")
    },
    heritage: {
        handler: handleTypicalFormat,
        name: "Heritage",
        query: [
            "(st:core OR st:expansion)",
            "-atag:external-ip"
        ].join(" AND ")
    },
    peak: {
        handler: handleTypicalFormat,
        name: "Peak Legacy",
        query: [
            "legal:legacy",
            "date<=emn"
        ].join(" AND ")
    },
    premodern: {
        handler: handleKnownFormat,
        name: "Premodern"
    }
};

// Card legality overrides to handle edge cases where scryfall doesn't have
// all the answers we need. Lookup by Oracle Id to handle every print
// and language.
const overrides = {
    classic: {
        // Candelabra of Tawnos
        "c7c7bffa-442d-4ba5-b778-ad394c192f27": "legal",
        // Cleanse
        "a610c77c-fe31-4465-a1c1-392db4ce4ed1": "legal",
        // Crusade
        "4692740f-be90-459f-8d90-c4ae71771595": "legal",
        // Entomb
        "299fc083-0834-4064-8344-f895aff68867": "legal",
        // Imprison
        "632de66b-2314-4299-847c-16a84bf9121f": "legal",
        // Invoke Prejudice
        "854ad486-0c59-4c57-9a76-ab1dff0ff37c": "legal",
        // Jihad
        "b18b9869-8490-4875-a5bb-484c3299f2c5": "legal",
        // Mind's Desire
        "b3739b5a-5731-4c64-a244-815a363b0d5c": "banned",
        // Pradesh Gypsies
        "37c49483-bef6-47c6-9354-ead8560d48da": "legal",
        // Sensei's Divining Top
        "13575cf9-65c1-4861-b21e-eb2155e07766": "legal",
        // Stone-Throwing Devils
        "124c8663-21f3-4cd8-a060-9d04be35c43f": "legal",
        // Survival of the Fittest
        "119d719d-e965-45b4-9bc9-ac03211b10c2": "legal",
        // Vengevine
        "7ed52301-81ea-4e7f-b985-cfab0593cae4": "banned",
        // Worldgorger Dragon
        "a628186d-b7d9-40a5-9ae2-fbc9d2a14c7c": "banned"
    },
    heritage: {
        // Candelabra of Tawnos
        "c7c7bffa-442d-4ba5-b778-ad394c192f27": "legal"
    },
    peak: {
        // Candelabra of Tawnos
        "c7c7bffa-442d-4ba5-b778-ad394c192f27": "legal",
        // Cleanse
        "a610c77c-fe31-4465-a1c1-392db4ce4ed1": "legal",
        // Crusade
        "4692740f-be90-459f-8d90-c4ae71771595": "legal",
        // Deathrite Shaman
        "22f1a4a4-c423-4d1c-8775-0ed604a9fa51": "legal",
        // Entomb
        "299fc083-0834-4064-8344-f895aff68867": "legal",
        // Gitaxian Probe
        "1d67f5ff-1fce-45e5-b6a1-416c569351e2": "legal",
        // Imprison
        "632de66b-2314-4299-847c-16a84bf9121f": "legal",
        // Invoke Prejudice
        "854ad486-0c59-4c57-9a76-ab1dff0ff37c": "legal",
        // Jihad
        "b18b9869-8490-4875-a5bb-484c3299f2c5": "legal",
        // Mind's Desire
        "b3739b5a-5731-4c64-a244-815a363b0d5c": "banned",
        // Pradesh Gypsies
        "37c49483-bef6-47c6-9354-ead8560d48da": "legal",
        // Sensei's Divining Top
        "13575cf9-65c1-4861-b21e-eb2155e07766": "legal",
        // Stone-Throwing Devils
        "124c8663-21f3-4cd8-a060-9d04be35c43f": "legal",
        // Undercity Informer
        "ccf5a0d4-69e8-4607-a76c-cfca336899e4": "legal"
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
        legalityCell.id = `${format}-legality`;
        legalityCell.className = "card-legality-item";
        const legalityTerm = document.createElement("dt");
        legalityTerm.textContent = supported_formats[format].name;
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

// Handle a typical custom format via a search query and exception lookup.
async function handleTypicalFormat(elem, format) {
    if (overrides?.[format]?.[oracleId]) {
        setLegality(elem, overrides[format][oracleId]);
        return;
    }

    const query = [
        `oracleid:${oracleId}`,
        `${supported_formats[format].query}`
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

// Load settings from browser storage.
async function getEnabledFormatsFromSettings() {
    const settings = await browser.storage.sync.get({
        "scryfall_formats": ["premodern", "heritage"]
    });

    const formats = settings?.scryfall_formats;
    const sanitizedFormats = formats
        .filter((format) => supported_formats.hasOwnProperty(format));
    return sanitizedFormats;
}

// Main function.
async function main() {
    // Get enabled formats from settings.
    const enabledFormats = await getEnabledFormatsFromSettings();
    if (enabledFormats?.length < 1) {
        return;
    }

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

    // Create new placeholder elements and insert them into the dom.
    createNewTableElements(enabledFormats);

    // Fetch and display legality for enabled formats.
    for (const format of enabledFormats) {
        const elem = document.querySelector(`#${format}-legality dd`);
        supported_formats[format].handler(elem, format);
    }
}
main();
