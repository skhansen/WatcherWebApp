/**
 * These samples show the currently supported Platform API calls being exercised.
 * Each of the sample functions takes the same parameters as the REST API,
 * and turns them into an xhr request using the Node request library.
 *
 * Run using:
 * > node platform.js
 */

var request = require("request");

// Setup your application's config data:
var appConfig = {
    appId: /*"layer:///apps/staging/*/"6eb07496-2646-11e5-b157-2d5d090202b9",//"<App ID Goes Here>",
    bearerToken: "UfjFghBINw4DSgUpfvPBGqRD8rAPToCBqeTgNaz9YQUM4kIp",//"<Authorization Token Goes Here>",
    serverUrl: "https://api.layer.com"
};
//layer:///conversations/ee2d55e6-3976-4e39-bce5-5cf1fd2941ed
(function () {

    // A data cache of settings, request headers, and responses
    var layersample = {
        config: {
            serverUrl: (appConfig.serverUrl || "https://api.layer.com") + "/apps/" + appConfig.appId
        },
        headers: {
            Accept: "application/vnd.layer+json; version=1.0",
            Authorization: "Bearer " + appConfig.bearerToken,
            "Content-type": "application/json"
        },
        cache: {
            newConversation: "/conversations/ee2d55e6-3976-4e39-bce5-5cf1fd2941ed",
            newMessage: null
        }
    };

    /**
     * Create a conversation
     *
     * @method
     * @param {string[]}    participants    Array of participant ids
     * @param {Mixed}       metadata        Hash of name value pairs.  Value must always be a string or subobject.
     * @param {Function}    callback
     */
    function createConversation(participants, metadata, callback) {
        return request({
            uri: layersample.config.serverUrl + "/conversations",
            method: "POST",
            body: {
                participants: participants,
                metadata: metadata
            },
            json: true,
            headers: layersample.headers
        }, callback);
    }

    /**
     * Change the participants of a conversation
     *
     * @method
     * @param {string}      conversationUrl URL of the resource we are operating upon
     * @param {Object}      changes         Describes participants to add/remove
     * @param {string[]}    changes.add     Array of participant ids to add
     * @param {string[]}    changes.remove  Array of participant ids to remove
     * @param {Function}    callback
     */
    function changeParticipants(conversationUrl, changes, callback) {
        return request({
            uri: conversationUrl + "/participants",
            method: "PATCH",
            body: changes,
            json: true,
            headers: layersample.headers
        }, callback);
    }

    /**
     * Send a messaging in a conversation
     *
     * @method
     * @param {string}      conversationUrl     URL of the resource we are operating upon
     * @param {Object}      sender              Either {name: "fred"} or {user_id: "my-participant-id"}
     * @param {object[]}    parts               Array of message parts
     * @param {object}      push                Notification options; typically
     *                                          {text: "I am a notification", sound: "arf.aiff"}
     * @param {Function}    callback
     */
    function sendMessage(conversationUrl, sender, parts, push, callback) {
        return request({
            uri: layersample.config.serverUrl + conversationUrl + "/messages",
            method: "POST",
            body: {
                sender: sender,
                parts: parts,
                push: push || {text: "You have a new message"}
            },
            json: true,
            headers: layersample.headers
        }, callback);
    }

    /*
    * GET /conversations/{conversation_id}/messages
    * Result is the method does not allow
    * It is not true.*/
    function getMessage(conversationUrl, sender, parts, push, callback) {
        $.ajax({
            url: layersample.config.serverUrl + conversationUrl + "/messages",
            method: "GET",
            headers: layersample.headers
        })
            .then(function (data, textStatus, xhr) {
                debugger;
                d.resolve(data.session_token);
            });

    }

    function getSession(token, sender, parts, push, callback) {
        return request({
            uri: layersample.config.serverUrl + "/sessions",
            method: "POST",
            body: {
                identity_token: token,
                app_id: appConfig.appId
            },
            json: true,
            headers: layersample.headers
        }, callback);
    }

    //sendMessage("layer:///conversations/2afe53d5-f08c-4ab9-8550-dd9d24c4e6c8", "BOT", "Hello world!")

    var a = getMessage(
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImN0eSI6ImxheWVyLWVpdDt2PTEiLCJraWQiOiJlZWU4MGRmYy0yOTYzLTExZTUtYjY4My02OGJjMjQwMDUxNjUifQ.eyJpc3MiOiI2ZWFmYjY1MC0yNjQ2LTExZTUtYWViYS0yZDVkMDkwMjAyYjkiLCJwcm4iOiIyIiwiaWF0IjoxNDQ0MDk0NjM1LCJleHAiOjE0NDQwOTgyMzUsIm5jZSI6Im1JOFlacVVpb3ZGZ2s2Q29Wa3ZTVk43WTdpM0lmRDE5LUswZVFzUFVNRHo4dXRCWkx2V21sTlNhT3I1bU1kOTdEV1FLOUhmWjdoMWFvX00tX2I4dHhnIn0.UUrweKK7kVKcyyn5FXshPbjVU-uFuKppQ9lSL-38IsvPiN0x1JA4v3mH5fNmnp50u6DJB5oOKnZdYJOHOSqKn9OtYm3CqMRM9N-O-lpVJVjefxNweLpCksUuFPZnTCi8DW6aTlR08CfXxlhSzEuQIlEcOISbE1U8oXXb0_LQGs0",
        {"user_id": "CPH_WATCHER_BOT_IDENTIFIER"},
        [{body: "Hello World", mime_type: "text/plain"}],
        {text: "The world has been greeted", sound: "greetings.aiff"},
        function (error, response, body) {
            debugger;
            // if (response.statusCode == 201) {
            //     layersample.cache.newMessage = body;
            // }

            // Print final output
            console.log("CONVERSATION:");
            console.dir(layersample.cache.newConversation);
            console.log("MESSAGE:");
            console.dir(layersample.cache.newMessage);
            console.log(response);
            console.log(error);
            console.log(body);
        }
    );

    // Create a conversation
    // createConversation(["layer-tester1", "layer-tester2"], {
    //     title: "Sample conversation",
    //     background_color: "#aaa"
    // }, function(error, response, body) {
    //     if (response.statusCode == 201) {
    //         layersample.cache.newConversation = body;

    //         // Change its participants
    //         return changeParticipants(layersample.cache.newConversation.url, {
    //             add: ["layer-tester3"],
    //             remove: ["layer-tester1"]
    //         }, function(error, response, body) {
    //             if (response.statusCode == 204) {
    //                 layersample.cache.newConversation.participants = ["layer-tester2", "layer-tester3"];

    //                 // Send a message
    //                 return sendMessage(
    //                     layersample.cache.newConversation.url,
    //                     {"user_id": "layer-tester2"},
    //                     [{body: "Hello World", mime_type: "text/plain"}],
    //                     {text: "The world has been greeted", sound: "greetings.aiff"},
    //                     function(error, response, body) {
    //                         if (response.statusCode == 201) {
    //                             layersample.cache.newMessage = body;
    //                         }

    //                         // Print final output
    //                         console.log("CONVERSATION:");
    //                         console.dir(layersample.cache.newConversation);
    //                         console.log("MESSAGE:");
    //                         console.dir(layersample.cache.newMessage);
    //                     }
    //                 );
    //                 // end of sendMessage
    //                 //
    //             }
    //         });
    //         // end of changeParticipants

    //     }
    // });
    // end of createConversation

})();

// var http = require('http');
//     http.createServer(function (req, res) {
//       res.writeHead(200, {'Content-Type': 'text/plain'});
//       res.end('Hello World\n');
//       sendMessage()
//     }).listen(1337, "127.0.0.1");
//     console.log('Server running at http://127.0.0.1:1337/');