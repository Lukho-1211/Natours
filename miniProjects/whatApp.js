var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
    'method': 'POST',
    'hostname': 'jjjp44.api.infobip.com',
    'path': '/whatsapp/1/message/template',
    'headers': {
        'Authorization': 'App e7af6715f7dad37eb2c8be1a1faac78f-e1ee1242-b434-41ff-ae10-6819b15a2a37',
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
            "from": "447860099299",
            "to": "27721172942",
            "messageId": "9c55727a-ea92-401e-b9c1-d94c11d7d107",
            "content": {
                "templateName": "message_test",
                "templateData": {
                    "body": {
                        "placeholders": ["Lukho"]
                    }
                },
                "language": "en"
            }
        }
    ]
});

req.write(postData);

req.end();