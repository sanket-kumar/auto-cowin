const player = require("play-sound")();
let path = require("path");

module.exports = {
    playCowinNotificationSound: function() {
        player.play(
            __dirname + "/../../media/Symphony_Notification_Sound-641142.mp3",
            (err) => {
                if (err) {
                    console.log(`Could not play sound: ${err}`);
                }
            }
        );
    },
};