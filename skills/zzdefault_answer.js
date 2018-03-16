module.exports = function(controller) {


  controller.hears(['(.*)'],'message_received', function(bot, message) {
    if (message.match[0] !== 'help' && message.match[0] !== 'request') {
        bot.reply(message,'I am sorry but I am still in alpha. Type help to see the things I can do:');
  }
});

}
