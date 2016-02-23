function getLinksArray() {
    var linksArray = Array();
    var url = window.location.host;
    for(var i=0; i < document.links.length; i++){
    	if (document.links[i].href.includes(url)) {
    		linksArray.push(document.links[i].href);
    	}
    }
    return linksArray;
}

function parseUrl(url) {
    var urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
    var domain = urlParts[0];
    return domain;
}

chrome.runtime.sendMessage({signal: "Links",
                link_Array: getLinksArray()}, function() {})