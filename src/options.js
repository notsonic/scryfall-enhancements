// MTG Enhancements options.js

/*jslint devel: true */
/*jslint browser: true */
/*global browser */

function formStatusToast(message) {
    const status = document.getElementById("status");
    status.textContent = message;
    setTimeout(function () {
        status.textContent = "";
    }, 750);
}

async function formSubmitHandler(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const optionsFromForm = {
        "mtgtop8_threat_level": Boolean(formData.get("mtgtop8_threat_level")),
        "scryfall_formats": formData.getAll("scryfall_formats")
    };

    await browser.storage.sync.set(optionsFromForm);
    formStatusToast("Options saved.");
}

async function restoreOptions() {
    const options = await browser.storage.sync.get({
        "mtgtop8_threat_level": true,
        "scryfall_formats": ["premodern", "heritage"]
    });

    document
        .getElementById("mtgtop8_threat_level")
        .checked = options.mtgtop8_threat_level;

    for (const format of options.scryfall_formats) {
        document
            .getElementById(`scryfall_formats_${format}`)
            .checked = true;
    }
}

function main() {
    const form = document.querySelector("#mtg_enhancements_options");
    form.addEventListener("submit", formSubmitHandler);
    document.addEventListener("DOMContentLoaded", restoreOptions);
}
main();
