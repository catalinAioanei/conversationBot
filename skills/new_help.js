module.exports = function(controller) {

  controller.hears('help', 'message_received', function(bot, message) {

    bot.reply(message, {
        text: 'Here is what I can do!',
        quick_replies: [
            {
                title: 'Help',
                payload: 'help'
            },
            {
                title: 'Request',
                payload: 'request'
            },
            {
                title: 'Email',
                payload: 'email'
            }
        ]
      },function() {});
  });

};
