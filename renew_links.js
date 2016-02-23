function getLinksArray() {
    var linksArray = Array();
    for(var i=0; i < document.links.length; i++){
        linksArray.push(document.links[i].href);
    }
    return linksArray;
}

chrome.runtime.sendMessage({signal: "renew_links",
                link_Array: getLinksArray()}, function() {});