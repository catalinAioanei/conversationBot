module.exports = function(controller) {

controller.hears('about', 'message_received', function(bot, message) {

    bot.startConversation(message, function(err, convo) {
        convo.say('We are a group of students that developed this simple bot as part of a university project');

    });

})
};
