
//get all contents of chrome storage
//chrome.storage.local.get(null,function (obj){
//    console.log(JSON.stringify(obj));
//});

function saveForDomain(domain_record, cb) {
    var storage_var = {}
    storage_var[domain_record.domain] = domain_record
    chrome.storage.local.set(storage_var,function (){
        console.log("Storage Succesful");
        /*
        chrome.storage.local.get(domain, function(obj) {
            console.log(JSON.stringify(obj[domain]));
        });
        */
    });
}

function scrape() {
    chrome.tabs.executeScript(null, {file:"getLinks.js"}, function() {});
}

function renew() {
    chrome.tabs.executeScript(null, {file:"renew_links.js"}, function() {});
}

function navigate_links(links, callback) {
    if (links.size == 0) {
        alert("done");
        return;
    } else {

        var link = links.keys().next();
        chrome.tabs.update({url: link.value}, function(tab) {
            chrome.tabs.onUpdated.addListener(function doStuff(tabId , info) {
                if (info.status == "complete") {
                    chrome.tabs.onUpdated.removeListener(doStuff);
                    chrome.runtime.onMessage.addListener(function renew_links(request, sender, sendResponse) {
                        chrome.runtime.onMessage.removeListener(renew_links);
                        if (request.signal == "renew_links") {
                            for (var new_link in request.link_Array) {
                                links.add(new_link);
                            }
                            links.delete(link.value);
                            callback(links, callback);
                        } 
                    });
                    renew();    
                }
            });
            
        });
    }     
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.signal == "Links") {
        var links = new Set(request.link_Array);
        navigate_links(links, navigate_links);
    } 
});


window.addEventListener('load', function(evt) {
    chrome.tabs.query({'active': true}, function (tabs) {
        var url = tabs[0].url;
        console.log("TAB");
        console.log();
        var urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
        var domain = urlParts[0];

        var domainNameLabel = document.getElementById("domainName");
        domainNameLabel.textContent = domain;

        chrome.storage.local.get(domain,function (obj){
            if (obj != null) {
                console.log(obj);
                var oForm = document.getElementById('addbookmark');
                oForm.elements["active"].checked = obj[domain]["active"]||false
                oForm.elements["company"].value = obj[domain]["company"]||""
                oForm.elements["app_name"].value = obj[domain]["app_name"]||""
                oForm.elements["api_key"].value = obj[domain]["api_key"]||"" 
                oForm.elements["base_url_api"].value = obj[domain]["base_url_api"]||""
                oForm.elements["base_url_input"].value = obj[domain]["base_url_input"]||""
            }
        });
        // get info of the domain if it is stored at options page
        if (localStorage.getItem(domain)) { 
            var obj = localStorage[domain];
            obj = JSON.parse(obj);
            console.log(obj);
            var oForm = document.getElementById('addbookmark');
            oForm.elements["active"].checked = obj["domain_record"]["active"]||false
            oForm.elements["company"].value = obj["domain_record"]["company"]||""
            oForm.elements["app_name"].value = obj["domain_record"]["app_name"]||""
            oForm.elements["api_key"].value = obj["domain_record"]["api_key"]||"" 
            oForm.elements["base_url_api"].value = obj["domain_record"]["base_url_api"]||""
            oForm.elements["base_url_input"].value = obj["domain_record"]["base_url_input"]||""

        } else { // show the global info when the domain is not stored at the options page 
            var obj = localStorage["current"];
            obj = JSON.parse(obj);
            console.log(obj);
            var oForm = document.getElementById('addbookmark');
            oForm.elements["active"].checked = false
            oForm.elements["company"].value = obj["current"]["company"]||""
            oForm.elements["app_name"].value = obj["current"]["app_name"]||""
            oForm.elements["api_key"].value = obj["current"]["api_key"]||"" 
            oForm.elements["base_url_api"].value = obj["current"]["base_url_api"]||""
            oForm.elements["base_url_input"].value = obj["current"]["base_url_input"]||""
        }
        function addBookmark() {
            var oForm = document.getElementById('addbookmark');
            var domain_record = {
                domain:domain,
                active: oForm.elements["active"].checked||false,
                company: oForm.elements["company"].value||"",
                app_name: oForm.elements["app_name"].value||"",
                api_key: oForm.elements["api_key"].value||"",
                base_url_input: oForm.elements["base_url_input"].value||"",
                base_url_api: oForm.elements["base_url_api"].value||"",
            }
            saveForDomain(domain_record);
            scrape();
            // chrome.tabs.update({
            //     url: "http://www.example.com/"
            // });
            // var helper = 123;
            // chrome.tabs.query({active: true}, function(tabs) {
            //     var tabURL = tabs[0].url;
            //     chrome.tabs.update({url: tabURL});
            //     chrome.tabs.executeScript("alert(1)", function() {});
            // });
            chrome.tabs.sendMessage(tabs[0].id,{signal: "infoUpdate",
                domain_record: domain_record});
            chrome.runtime.sendMessage({signal: "infoUpdate",
                domain_record: domain_record});
            return false;
        }

        document.getElementById('addbookmark').onsubmit = function() {
            return false;
        }
        document.getElementById('addbookmark').addEventListener('submit', addBookmark);
        /*
        chrome.runtime.getBackgroundPage(function(eventPage) {
            // Call the getPageInfo function in the event page, passing in 
            // our onPageDetailsReceived function as the callback. This injects 
            // content.js into the current tab's HTML
            eventPage.getPageDetails(onPageDetailsReceived);
        });
        */
    });
});