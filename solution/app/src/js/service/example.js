/*
 * Examples are written in JQuery to keep things simple, and limits sample code to
 * using only frameworks that most people are familiar with.
 *
 * Unfortunately, JQuery has some limitations, so in some cases it was necessary to fallback to
 * the raw XMLHttpRequest object.
 *
 * This example consists of two things:
 * 1. A series of functions, each of which returns a JQuery Deferred
 *    Either via return $.ajax(...) or by explicitly creating a new $.Deferred().
 * 2. A series of ".then(callbacks)" calls
 *
 * For those unfamiliar with Deferreds, When an asynchronous behavior is completed,
 * The Deferred is resolved: d.resolve(data);
 * When the Deferred is resolved, callbacks defined by "then" are then triggered.
 *
 * The script below will run, but to run it successfully, you will need to replace:
 * 1. window.appId with your appId
 * 2. getIdentityToken() with a function that gets your identity token
 */
(function () {
    if (!window.appId) {
        throw new Error("Please provide an App ID from your developer dashboard");
    }

    var layersample = {
        config: {
            serverUrl: window.serverUrl || "https://api.layer.com",
            appId: window.appId
        },
        headers: {
            Accept: "application/vnd.layer+json; version=1.0",
            Authorization: "",
            "Content-type": "application/json"
        },
        cache: {
            conversationList: [],
            sampleConversation: null,
            sampleMessage1: null,
            sampleMessage2: null,
            sampleContent1: null,
            sampleContent2: null
        },
        testData: {
            imageBlob: generateBlob(),
            longText: new Array(5000).join("?!")
        }
    };


    /**
     * To get started, we must obtain a Nonce
     *
     * http://bit.ly/1xYNf7z#obtaining-a-nonce
     *
     * @method
     * @return {$.Deferred}
     */
    function getNonce() {
        var d = new $.Deferred();
        $.ajax({
            url: layersample.config.serverUrl + "/nonces",
            method: "POST",
            headers: layersample.headers
        })
            .done(function (data, textStatus, xhr) {
                d.resolve(data.nonce);
            });
        return d;
    }

    /**
     * Example of getting an identity token.
     *
     * Replace this function with whatever service you are
     * getting an Identity Token from.
     *
     * @method
     * @param  {string} nonce   Token is provided by REST server for use by identity provider
     * @return {$.Deferred}
     */
    function getIdentityToken(nonce) {
        var d = new $.Deferred();
        $.ajax({
            url: window.identityProvider + "/identity_tokens",
            headers: {
                "X_LAYER_APP_ID": layersample.config.appId,
                "Content-type": "application/json",
                "Accept": "application/json"
            },
            method: "POST",
            data: JSON.stringify({
                app_id: layersample.config.appId,
                user_id: window.userIdMain,
                nonce: nonce
            })
        })
            .then(function (data, textStatus, xhr) {
                d.resolve(data.identity_token);
            });
        return d;
    }

    /**
     * Create a session using the identity_token
     *
     * http://bit.ly/1xYNf7z#authenticating-with-an-identity-token
     *
     * @method
     * @param  {string} identityToken   Identity token returned by your identity provider
     * @return {$.Deferred}
     */
    function getSession(identityToken) {
        var d = new $.Deferred();
        $.ajax({
            url: layersample.config.serverUrl + "/sessions",
            method: "POST",
            headers: layersample.headers,
            data: JSON.stringify({
                "identity_token": identityToken,
                "app_id": layersample.config.appId
            })
        })
            .then(function (data, textStatus, xhr) {
                d.resolve(data.session_token);
            });
        return d;
    }

    /**
     * Create a conversation
     *
     * http://bit.ly/1xYNf7z#creating-a-conversation
     *
     * @method
     * @param  {string[]} participants  Array of participant-ids
     * @return {$.Deferred}
     */
    function createConversation(participants) {
        return $.ajax({
            url: layersample.config.serverUrl + "/conversations",
            method: "POST",
            headers: layersample.headers,
            data: JSON.stringify({
                participants: participants,
                distinct: false,
                metadata: {
                    "background-color": "#aaaacc",
                    "is_favorite": "true",
                    "last_3_participants": {
                        "fred_baggins": "2015-06-22T16:47:42.127Z",
                        "frodo_flinstone": "2015-06-22T15:47:40.327Z",
                        "gandalf_of_oz": "2015-06-22T16:43:42.127Z"
                    }
                }
            })
        });
    }


    /**
     * Lists all Conversations
     *
     * http://bit.ly/1xYNf7z#listing-conversations
     *
     * @method
     * @return {$.Deferred}
     */
    function getConversations() {
        return $.ajax({
            url: layersample.config.serverUrl + "/conversations",
            method: "GET",
            headers: layersample.headers
        })
    }

    /**
     * Download description of a single Conversation
     *
     * http://bit.ly/1xYNf7z#listing-conversations
     *
     * @method
     * @param  {string} conversationUrl     URL of the requested resource
     * @return {$.Deferred}
     */
    function getOneConversation(conversationUrl) {
        return $.ajax({
            url: conversationUrl,
            method: "GET",
            headers: layersample.headers
        })
    }

    /**
     * Listing Messages in a Conversation:
     *
     * http://bit.ly/1xYNf7z#listing-messages-in-a-conversation
     *
     * @method
     * @param  {string} conversationUrl     URL of the requested resource
     * @return {$.Deferred}
     */
    function getMessages(conversationUrl) {
        return $.ajax({
            url: conversationUrl + "/messages",
            method: "GET",
            headers: layersample.headers
        })
    }

    /**
     * Retrieving a single Message
     *
     * http://bit.ly/1xYNf7z#retrieving-a-message
     *
     * @method
     * @param  {string} messageUrl      URL of the requested resource
     * @return {$.Deferred}
     */
    function getOneMessage(messageUrl) {
        return $.ajax({
            url: messageUrl,
            method: "GET",
            headers: layersample.headers
        })
    }

    /**
     * Sending a Message:
     *
     * http://bit.ly/1xYNf7z#sending-a-message
     *
     * This function sends only a single message part, but could easily be
     * adapted to send more.
     *
     * @method
     * @param  {string} conversationUrl     URL of the resource to operate upon
     * @param  {string} body                Message contents
     * @param  {string} mimeType            Mime type for the message contents (e.g. "text/plain")
     * @return {$.Deferred}
     */
    function sendMessage(conversationUrl, body, mimeType) {
        return $.ajax({
            url: conversationUrl + "/messages",
            method: "POST",
            headers: layersample.headers,
            data: JSON.stringify({
                parts: [{
                    body: body,
                    mime_type: mimeType
                }]
            })
        });
    }

    /**
     * Writing a Receipt for a Message (i.e. marking it as read or delivered)
     *
     * http://bit.ly/1xYNf7z#writing-a-receipt-for-a-message
     *
     * @method
     * @param  {string} messageUrl      URL of the resource to operate upon
     * @return {$.Deferred}
     */
    function markAsRead(messageUrl) {
        return $.ajax({
            url: messageUrl + "/receipts",
            method: "POST",
            headers: layersample.headers,
            data: JSON.stringify({type: "read"})
        });
    }

    /**
     * Delete a message/conversation from the server and all mobile clients
     *
     * http://bit.ly/1xYNf7z#deleting-a-message
     * http://bit.ly/1xYNf7z#deleting-a-conversation
     *
     * @method
     * @param  {string} resourceUrl      URL of the resource to operate upon
     * @return {$.Deferred}
     */
    function deleteResource(resourceUrl) {
        return $.ajax({
            url: resourceUrl + "?destroy=true",
            method: "DELETE",
            headers: layersample.headers
        });
    }


    /**
     * For sending large files/content, use the Rich Content APIs:
     *
     * http://bit.ly/1xYNf7z#rich-content
     *
     * This method is Step 1 of the sequence: Initiating a Rich Content Upload.
     *
     * http://bit.ly/1xYNf7z#initiating-a-rich-content-upload
     *
     * @method
     * @param  {string}     mimeType    Mime type for the content that is to be uploaded
     * @param  {integer}    size        Size of the content that is to be uploaded
     * @return {$.Deferred}
     */
    function initiateRichContentUpload(mimeType, size) {
        return $.ajax({
            url: layersample.config.serverUrl + "/content",
            method: "POST",
            headers: $.extend({
                "Upload-Content-Type": mimeType,
                "Upload-Content-Length": size,
                "Upload-Origin": window.location.origin
            }, layersample.headers)
        });
    }

    /**
     * For sending large files/content, use the Rich Content APIs:
     *
     * http://bit.ly/1xYNf7z#rich-content
     *
     * This method is Step 2 of the sequence: Upload the Content
     *
     * https://cloud.google.com/storage/docs/json_api/v1/how-tos/upload#resumable
     *
     * NOTE: JQuery doesn't handle this very well.
     *
     * @method
     * @param  {string} url     Url provided by Step 1
     * @param  {Any}    data    Typically a string or blob to upload to the server
     * @return {$.Deferred}
     */
    function uploadRichContent(url, data) {
        var d = new $.Deferred();
        var r = new XMLHttpRequest();
        r.open('PUT', url, true);
        r.send(data);
        r.onload = function () {
            d.resolve(r.response);
        };
        return d;
    }

    /**
     * For sending large files/content, use the Rich Content APIs:
     *
     * http://bit.ly/1xYNf7z#rich-content
     *
     * This method is Step 3 of the sequence: Sending a Message
     *
     * http://bit.ly/1xYNf7z#sending-a-message-including-rich-content
     *
     * This example sends a Message with two Message Parts
     *
     * @method
     * @param  {string} conversationUrl     URL of the resource to operate upon
     * @param  {Object} part1               First Message Part
     * @param  {string} part1.mimeType      Mime type for the first Message Part
     * @param  {string} part1.contentId     Id returned in Step 1
     * @param  {Object} part2               Second Message Part
     * @param  {string} part2.mimeType      Mime type for the first Message Part
     * @param  {string} part2.body          Contents of the second message part
     * @return {$.Deferred}
     */
    function sendRichContentMessage(conversationUrl, part1, part2) {
        return $.ajax({
            url: conversationUrl + "/messages",
            method: "POST",
            headers: layersample.headers,
            data: JSON.stringify({
                parts: [
                    {
                        mime_type: part1.mimeType,
                        content: {
                            id: part1.contentId,
                            size: part1.size
                        }
                    },
                    {
                        body: part2.body,
                        mime_type: part2.mimeType
                    }
                ]
            })
        });
    }

    /**
     * Download rich content from the cloud server (ascii version)
     *
     * @method
     * @param  {string} url     download_url that is in message_part.content.download_url
     * @return {$.Deferred}
     */
    function downloadAsciiRichContent(url) {
        return $.ajax({
            url: url,
            method: "GET"
        });
    }

    /**
     * Download rich content from the cloud server (binary version)
     *
     * Not done with jquery because: http://bugs.jquery.com/ticket/11461 (Doh!)
     *
     * @method
     * @param  {string} url     download_url that is in message_part.content.download_url
     * @return {$.Deferred}
     */
    function downloadBinaryRichContent(url) {
        var d = new $.Deferred();
        var r = new XMLHttpRequest();
        r.responseType = "blob";
        r.open('GET', url, true);
        r.send();
        r.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                d.resolve(btoa(reader.result));
            };
            reader.readAsBinaryString(this.response)
        };

        return d;
    }

    /**
     * Add and remove participants from this conversation
     *
     * http://bit.ly/1xYNf7z#addremove-participants
     *
     * @method
     * @param  {string} conversationUrl     URL of the conversation to update
     * @param  {string[]} addUsers          Array of users to add to the conversation
     * @param  {string[]} removeUsers       Array of users to remove from the conversation
     * @return {$.Deferred}
     */
    function addRemoveParticipants(conversationUrl, addUsers, removeUsers) {
        var operations = [];
        addUsers.forEach(function (user) {
            operations.push({operation: "add", property: "participants", value: user});
        });

        removeUsers.forEach(function (user) {
            operations.push({operation: "remove", property: "participants", value: user});
        });

        return $.ajax({
            url: conversationUrl,
            method: "PATCH",
            headers: $.extend({}, layersample.headers, {
                "Content-Type": "application/vnd.layer-patch+json"
            }),
            data: JSON.stringify(operations)
        });
    }

    /**
     * Set and delete metadata keys/values from this conversation
     *
     * http://bit.ly/1xYNf7z#patching-metadata-structures
     *
     * @method
     * @param  {string} conversationUrl     URL of the conversation to update
     * @param  {object} metadataChanges     Any key in the object will be assign with the specified value.
     *                                      If the value is undefined, delete the key.
     * @return {$.Deferred}
     *
     * NOTE: Method is not recursive, so does not currently work on nested metadata keys
     */
    function patchConversationMetadata(conversationUrl, metadataChanges) {
        var operations = [];
        for (var key in metadataChanges) {
            if (metadataChanges.hasOwnProperty(key)) {
                var value = metadataChanges[key];
                if (value === undefined) {
                    operations.push({operation: "delete", property: "metadata." + key});
                } else {
                    operations.push({operation: "set", property: "metadata." + key, value: value});
                }
            }
        }

        return $.ajax({
            url: conversationUrl,
            method: "PATCH",
            headers: $.extend({}, layersample.headers, {
                "Content-Type": "application/vnd.layer-patch+json"
            }),
            data: JSON.stringify(operations)
        });
    }


    /**
     * This generates sample data.
     *
     * Sets up imageBlob variable with a blob.
     * More commonly you'll use
     *
     *     var fileInput = document.getElementById("myFileInput");
     *     var blob = fileInput.files[0];
     *
     * @method
     * @return {Blob}
     */
    function generateBlob() {
        var imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC",
            imageBinary = atob(imgBase64),
            buffer = new ArrayBuffer(imageBinary.length),
            view = new Uint8Array(buffer),
            i;

        for (i = 0; i < imageBinary.length; i++) {
            view[i] = imageBinary.charCodeAt(i);
        }
        return new Blob([view], {type: "image/png"});
    }


    // Get a nonce
    getNonce()

        // Use the nonce to get an identity token
        .then(function (nonce) {
            return getIdentityToken(nonce);
        })

        // Use the identity token to get a session
        .then(function (identityToken) {
            return getSession(identityToken);
        })

        // Store the sessionToken so we can use it in the header for our requests
        .then(function (sessionToken) {
            layersample.headers.Authorization =
                'Layer session-token="' + sessionToken + '"';

            // Now we can do stuff, like get a list of conversations
            return getConversations();
        })

        // getConversations() returns a list of conversations
        .then(function (conversations) {
            layersample.cache.conversationList = conversations;

            // Now lets create a conversation
            return createConversation(["a", "b", "c"]);
        })

        // createConversation returns a conversation object;
        // Using conversation object's url, we can download it any time
        .then(function (conversation) {
            layersample.cache.sampleConversation = conversation;

            // Demonstrate downloading the object we just created
            return getOneConversation(conversation.url);
        })

        // addRemoveParticipants allows us to change the participants of a conversation
        .then(function (conversation) {
            return addRemoveParticipants(layersample.cache.sampleConversation.url,
                ["sauruman_the_annoying", "smeagol_baggins"],
                ["a", "b"]
            );
        })

        // Patch metadata deletes frodo.flinstone, adds samwise.flanders and changes is_favorite to false.
        .then(function () {
            return patchConversationMetadata(layersample.cache.sampleConversation.url,
                {
                    "is_favorite": "false",
                    "last_3_participants.frodo_flinstone": undefined,
                    "last_3_participants.samwise_flanders": "2015-06-22T16:47:42.127Z"
                }
            );
        })

        // getOneConversation returns a conversation identical to sampleConversation
        .then(function () {

            // Lets send a message on that conversation
            return sendMessage(layersample.cache.sampleConversation.url,
                "Hello World", "text/plain");
        })

        // sendMessage returns a message object
        // Using the message's url, we can perform operations upon it.
        .then(function (message) {
            layersample.cache.sampleMessage1 = message;

            // Once we have a message url, we can download it any time
            return getOneMessage(message.url);
        })

        // getOneMessage should return an identical message to sampleMessage1
        .then(function (message) {

            // Sometimes though you just want a full list of messages
            return getMessages(layersample.cache.sampleConversation.url);
        })

        // getMessages returns an array of messages; in this case,
        // an array of one message that is identical to sampleMessage1.
        .then(function (messages) {

            // Lets mark that message as read.  Well, ok, we created it,
            // so its already marked as read for us, but this shows how to do it.
            return markAsRead(messages[0].url);
        })

        // And of course we can delete the message we created
        .then(function () {
            return deleteResource(layersample.cache.sampleMessage1.url);
        })

        // Request a URL for uploading Rich Content.
        .then(function () {
            return initiateRichContentUpload("text/plain", layersample.testData.longText.length);
        })

        // initiateRichContentUpload returns a new Content object
        // which contains an upload_url for us to upload our rich content
        .then(function (contentData) {
            layersample.cache.sampleContent1 = contentData;
            return uploadRichContent(contentData.upload_url, layersample.testData.longText);
        })

        // Once upload completes, we can send a message using that Rich Content ID
        .then(function () {
            return sendRichContentMessage(
                layersample.cache.sampleConversation.url,

                // Message Part 1
                {
                    contentId: layersample.cache.sampleContent1.id,
                    mimeType: "text/plain",
                    size: layersample.testData.longText.length
                },

                // Message Part 2
                {
                    body: "Farewell Cruel World",
                    mimeType: "text/pain"
                }
            );
        })

        // sendRichContentMessage returns the new message
        .then(function (message) {

            // The new message will have a content.download_url; lets download the data.
            return downloadAsciiRichContent(message.parts[0].content.download_url);
        })

        // downloadAsciiRichContent returns our text
        .then(function (text) {

            // Append the text to a dom node and add it to our document
            var div = document.createElement("div");
            div.innerHTML = text;
            document.body.appendChild(div);

            // Now lets repeat using binary data
            return initiateRichContentUpload("image/png", layersample.testData.imageBlob.size);
        })

        // initiateRichContentUpload returns a new Content object
        // which contains an upload_url for us to upload our rich content
        .then(function (contentData) {
            layersample.cache.sampleContent2 = contentData;
            return uploadRichContent(contentData.upload_url, layersample.testData.imageBlob);
        })

        // Once upload completes, we can send a message using that Rich Content ID
        .then(function () {
            return sendRichContentMessage(
                layersample.cache.sampleConversation.url,

                // Message Part 1:
                {
                    contentId: layersample.cache.sampleContent2.id,
                    mimeType: "image/png",
                    size: layersample.testData.imageBlob.size
                },

                // Message Part 2:
                {
                    body: "Farewell Cruel World",
                    mimeType: "text/pain"
                }
            );
        })

        // sendRichContentMessage returns the new message
        // The new message will have a content.download_url; lets download the data.
        .then(function (message) {

            // Simplest way to deal with Rich Content if its an image is
            // to just set an img.src = download_url:
            var img = document.createElement("img");
            img.src = message.parts[0].content.download_url;
            document.body.appendChild(img);

            // Sometimes though you want the raw binary or base64 encoded data:
            return downloadBinaryRichContent(message.parts[0].content.download_url);
        })

        // downloadBinaryRichContent returns a base64 encoded image
        .then(function (base64img) {
            var img = document.createElement("img");
            img.src = "data:image/png;base64," + base64img;
            document.body.appendChild(img);
        });
})();