// Store the storage
var storage = chrome.storage.sync;

// Main wipe data function
function wipeData() {
    storage.get({
        browsing: false,
        download: false,
        cookies: false,
        webData: false,
        cache: false,
        passwords: false,
        autoFill: false,
        localData: false
    }, function(items) {

        // Start list for what needs to be removed
        let remove = {};

        // History
        remove.history = items.browsing;

        // Downloads
        remove.downloads = items.download;

        // Cookies
        remove.cookies = items.cookies;

        // Cache
        remove.cache = items.cache;
        remove.cacheStorage = items.cache;
        remove.appcache = items.cache;

        // Passwords
        remove.passwords = items.passwords;

        // Form Data
        remove.formData = items.autoFill;

        // Local Data
        remove.localStorage = items.localData;

        // WebData
        remove.fileSystems = items.webData;
        remove.indexedDB = items.webData;
        remove.pluginData = items.webData;
        remove.serverBoundCertificates = items.webData;
        remove.webSQL = items.webData;

        // Remove then all that was set
        chrome.browsingData.remove({}, remove);

        // Extra removal
        if(items.cookies)
            chrome.contentSettings.cookies.clear({});

    })
}

// Listeners for when to delete all data

// Startup
chrome.runtime.onStartup.addListener(function() {
    wipeData();
});

// On all windows removed (browser closed)
chrome.windows.onRemoved.addListener(function(id) {
    chrome.windows.getAll(function(windowNow) {
        if (windowNow.length === 0)
            wipeData();
    })
});

// Open options when clicked
chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.create({url: chrome.runtime.getManifest().options_page});
});
