// Some vars
const FADE_TIME = 100;
const SHOW_TIMEOUT = 500;

// Get the background storage
var background = chrome.extension.getBackgroundPage();
var storage  = chrome.storage.sync;

// On page load
$(document).ready(function() {

    // Attach the wiper to when click
    $("#delete").on("click", function() {
        // Wipe the data
        background.wipeData();
        // Show popup
        let savedItem = $("#wiped");
        // Fade properly
        savedItem.fadeIn(FADE_TIME);
        // Call the hide function after timeout
        setTimeout(function () {
            savedItem.fadeOut(FADE_TIME);
        }, SHOW_TIMEOUT);
    });

    // Get the local storage containing what needs to be deleted
    storage.get({
        browsing: true,
        download: true,
        cookies: true,
        cache: true,
        passwords: true,
        autoFill: true,
        localData: true,
        webData: true,
    }, function (items) {
        // Iterate the items and check the ones that were saved
        for (let item in items) {
            document.getElementById(item).checked = items[item];
            document.getElementById(item).addEventListener("click", updateOptions)
        }
    });

    function updateOptions(item) {
        // Start update object empty
        let update = {};
        // Add the checked item to the update list
        update[item.target.id] = document.getElementById(item.target.id).checked;
        // Then sync the options with memory
        chrome.storage.sync.set(update, function() {
            // Store the item that show it was saved
            let savedItem = $("#saved");
            // Fade properly
            savedItem.fadeIn(FADE_TIME);
            // Call the hide function after timeout
            setTimeout(function () {
                savedItem.fadeOut(FADE_TIME);
            }, SHOW_TIMEOUT);
        })
    }

});