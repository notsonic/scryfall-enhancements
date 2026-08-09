// MTG Enhancements options.js

/*jslint devel: true */
/*jslint browser: true */
/*global browser */

const form = document.querySelector("#mtg_enhancements_options");

function formSubmitHandler(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const settingsFromForm = {
        "mtgtop8_threat_level": Boolean(formData.get("mtgtop8_threat_level")),
        "scryfall_formats": formData.getAll("scryfall_formats")
    };
    browser.storage.sync.set(settingsFromForm, saveCallback());
}
form.addEventListener("submit", formSubmitHandler);

function saveCallback() {
    const status = document.getElementById("status");
    status.textContent = "Options saved.";
    setTimeout(function () {
        status.textContent = "";
    }, 750);
}

function restoreOptions() {
    browser.storage.sync.get({
        "mtgtop8_threat_level": true,
        "scryfall_formats": ["premodern", "heritage"]
    }, function (settings) {
        document
            .getElementById("mtgtop8_threat_level")
            .checked = settings.mtgtop8_threat_level;
        for (const format of settings.scryfall_formats) {
            document
                .getElementById(`scryfall_formats_${format}`)
                .checked = true;
        }
    });
    return;
}
document.addEventListener("DOMContentLoaded", restoreOptions);
