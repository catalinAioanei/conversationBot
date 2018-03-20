module.exports = function(controller) {

    controller.on('hello', function(bot, message) {

        bot.reply(message,`Welcome, new human! Type 'help' to see the things I can do:`);

    });

    controller.on('welcome_back', function(bot, message) {
          bot.reply(message, {
              text: 'Welcome! Here are the things I can do:',
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
                  },
                  {
                      title: 'About',
                      payload: 'about'
                  }
              ]
            },function() {});
      });

}
