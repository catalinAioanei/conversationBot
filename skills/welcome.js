module.exports = function(controller) {

    controller.on('hello', function(bot, message) {

        bot.reply(message,'Welcome, new human! Type help to see the things I can do:');

    });

    controller.on('welcome_back', function(bot, message) {
          // a known user has started a new, fresh session
          bot.reply(message,'Welcome back! Type help to see the things I can do:');
      });

}
