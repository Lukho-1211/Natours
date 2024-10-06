var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
    'method': 'POST',
    'hostname': 'api.infobip.com',
    'path': '/sms/2/text/advanced',
    'headers': {
        'Authorization': 'App cdb100d525f19be8b39fe1df4aab0df4-e6460cf8-96ea-4952-9bc8-0111bd862953',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    'maxRedirects': 20
};

var req = https.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        console.log(body.toString());
    });

    res.on("error", function (error) {
        console.error(error);
    });
});

var postData = JSON.stringify({
    "messages": [
        {
            "destinations": [{"to":"27721172942"}],
            "from": "447491163443",
            "text": "This is a message from your APP. We just scanned your bank account. Relax you not Hacked awunamali (LOL)."
        }
    ]
});

req.write(postData);

req.end();