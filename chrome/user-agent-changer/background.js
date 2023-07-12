/* Handles the background functions of the extension
 */

"use strict";

// save the original
var originalUserAgent = navigator.userAgent;

// local variable for the ua
var userAgentString = null;

// variables that will be mirrored to the storage
var localVariables = {
    "status": false,
    "localString": ""
};
var localVariablesKeys = Object.keys(localVariables);

// shorten the chrome storage var
var storage = chrome.storage.sync;

//--------------------------------------------//

function userAgentHandler(receivedDetails) {

    // don't mess with the headers if the extension is not on or the ua is invalid
    if (!localVariables["status"] || !userAgentString)
        return;

    // iterate the headers and change the user agent
    for (let headersIndex = 0; headersIndex < receivedDetails.requestHeaders.length; ++headersIndex) {
        if (receivedDetails.requestHeaders[headersIndex].name === 'User-Agent') {
            receivedDetails.requestHeaders[headersIndex].value = userAgentString;
            break;
        }
    }

    return { requestHeaders: receivedDetails.requestHeaders };
}

// add a listener to acquire the headers before the request
chrome.webRequest.onBeforeSendHeaders.addListener(
    userAgentHandler,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
);

function updateIcon() {
    // get the original icons and change them
    let iconsOriginal = chrome.runtime.getManifest().icons;

    // update the icons
    if(localVariables["status"]) {
        chrome.browserAction.setIcon(Object({ path: iconsOriginal }));
    } else {
        // create new object
        let newIcons = {};
        // update icons to mono variant
        let dirSep = '/';
        let nameSep = '-';
        let insert = {
            index: 1,
            what: "mono"
        };
        // iterate all icons
        for(let eachKey in iconsOriginal) {
            // get the value
            let eachValue = iconsOriginal[eachKey];
            // split path and name
            let path = eachValue.substring(0, eachValue.lastIndexOf(dirSep));
            let name = eachValue.substring(eachValue.lastIndexOf(dirSep) + 1);
            // transform name
            let newNameSplit = name.split(nameSep);
            newNameSplit.splice(insert["index"], 0, insert["what"])
            let newName = newNameSplit.join(nameSep);
            // insert into new object
            newIcons[eachKey] = `${path}/${newName}`;
        }
        // insert the new icons
        chrome.browserAction.setIcon({ path: newIcons });
    }
}

function getUserAgentPieces() {
    let regexSpaces = / (?=(?:"[^"]*"|\([^()]*\)|\[[^\[\]]*]|\{[^{}]*}|[^"\[{}()\]])*$)/
    return originalUserAgent.split(regexSpaces);
}

function buildAgent() {

    // get the original ua in pieces
    let userAgentPieces = getUserAgentPieces();

    // get the local string matched that will be replaced
    let matchedParts = localVariables["localString"].match(/\${{(.*?)}}/g);
    if (matchedParts === null) matchedParts = [];

    // initialize the variable that contains the final ua
    let outputAgent = localVariables["localString"];

    for (let piecesIndex = 0; piecesIndex < matchedParts.length; ++piecesIndex) {

        // check which piece was selected
        let numberNow = parseInt(matchedParts[piecesIndex].match(/\${{(.*?)}}/)[1]);

        // match selected piece with the original ua list
        if ((numberNow >= 0) && (numberNow < userAgentPieces.length)) {
            outputAgent = outputAgent.replace(matchedParts[piecesIndex], userAgentPieces[numberNow]);
        } else {
            outputAgent = outputAgent.replace(matchedParts[piecesIndex], "");
        }

    }

    // return the build ua
    return outputAgent;

}

function updateAgent() {
    userAgentString = buildAgent();
}

// get the variables from the local storage
storage.get(localVariablesKeys, function(returnedData){

    let storageBuffer = {};

    let returnedDataKeys = Object.keys(returnedData);

    // iterate the local variables and initialize them
    for (let i = 0; i < localVariablesKeys.length; ++i) {

        // check if it was on the storage
        let keyNowOffset = returnedDataKeys.indexOf(localVariablesKeys[i]);

        if (keyNowOffset > -1) {
            // if it was found, set it to the local variables
            localVariables[localVariablesKeys[i]] = returnedData[returnedDataKeys[keyNowOffset]];
        } else {
            // if not add it to be stored
            storageBuffer[localVariablesKeys[i]] = localVariables[localVariablesKeys[i]];
        }

    }

    // store everything in the buffer
    storage.set(storageBuffer, function(){
        // raise alert if an error occurred
        if (chrome.runtime.lastError) alert("Error on setting the storage data");
    });

    // update the icon once the data is normalized
    updateIcon();

    // build the ua string
    updateAgent();

});
