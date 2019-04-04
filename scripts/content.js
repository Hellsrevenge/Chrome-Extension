chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    console.log("Search for terms page");
    var data = request.data || {};

    var found = [];
    var linksList = document.querySelectorAll('a');
    [].forEach.call(linksList, function(header) {
        if (
            (header.innerHTML.indexOf("terms") !== -1) ||
            (header.innerHTML.indexOf("Terms") !== -1) ||
            (header.innerHTML.indexOf("conditions") !== -1) ||
            (header.innerHTML.indexOf("Conditions") !== -1)
        ) {
            found.push(header.href);
        }
    });

    var xmlhttp = new XMLHttpRequest();
    var url = found[0];

    xmlhttp.onreadystatechange=function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            optOut(found[0], xmlhttp.responseText);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    sendResponse({data: data, success: true});
});

function optOut(url, response) {
    var keywords = [
        "opt-out",
        "Opt-Out",
        "Opt-out",
        "Opt Out",
        "opt out",
        "opting out",
        "opted out"
    ];

    let found = [];
    for (var i in keywords) {
        var index;
        var indexes = findIndexes(response, keywords[i]);

        for (var j in indexes) {
            index = indexes[j];

            let piece = response.substring(index - 100, index + 100);
            let email = /[a-z0-9\._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,16})/;
            let matches;

            matches = email.exec(piece);
            if (matches != null) {
                found.push(matches[0]);
            }
        }
    }

    Date.prototype.mmddyyyy = function() {
        var mm = (this.getMonth()+1).toString();
        var dd  = this.getDate().toString();
        var yyyy = this.getFullYear().toString();
        return (mm[1]?mm:"0"+mm[0]) +"/"+ (dd[1]?dd:"0"+dd[0])  + "/" + yyyy;
    };

    var date = new Date();

    var start = url.indexOf("://");
    if (start === -1) {
        start = 0;
    } else {
        start += 3;
    }

    var end = url.substr(start).indexOf("/");
    // Sitename with http://www.
    //var siteName = url.substring(0, start + end);
    var siteName = url.substring(start, start + end);
    if (siteName.indexOf("www.") !== -1) {
        siteName = siteName.substr(4);
    }

    if (found.length > 0) {
        window.location.href = "mailto:" + found[0] + "?subject=Attn:%20Legal%20Department&body=I%20am%20writing%20to%20inform%20you%20that%20I%20opt-out%20of%20the%20binding%20arbitration%20and%20class%20action%20waiver%20in%20accordance%20with%20your%20User%20agreement%20I%20signed%20on%20"+ date.mmddyyyy() + ".%20As%20requested%20my%20information%20is%20as%20such:%0D• My name: name\n" +
            "%0D• Address goes here\n" +
            "%0D• telephone number: 55555555\n" +
            "%0D• email address: [insert sending email address]\n" +
            "%0DAs of today%20" + date.mmddyyyy() + ", I, name, am giving " + siteName + " legal notice that I am opting out of the Arbitration Provision of " + siteName + " user agreement.\n" +
            "\n" +
            "%0D%0DI request email confirmation that this notice has received within seven days.\n" +
            "\n" +
            "%0D%0DRegards," +
            "%0D%0Dname";
    }
}

function findIndexes(source, find) {
    if (!source) {
        return [];
    }
    if (!find) {
        return source.split('').map(function(_, i) { return i; });
    }
    var result = [];
    var i = 0;
    while(i < source.length) {
        if (source.substring(i, i + find.length) == find) {
            result.push(i);
            i += find.length;
        } else {
            i++;
        }
    }
    return result;
}
