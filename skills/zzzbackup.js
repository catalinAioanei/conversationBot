var request = require('request');
var wordfilter = require('wordfilter');
wordfilter.addWords(['zebra','elephant']);


module.exports = function(controller) {

    controller.hears('request', 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {
          convo.addMessage({
            text: 'Glad we could help you :) .',
          }, 'yes_thread');

          convo.addMessage({
            text: 'Hmm... Let me try something else.',
          }, 'no_thread');

          convo.addMessage({
            text: 'I am sorry but I cannot process that answer.',
            action: 'default',
          }, 'yes_thread');

            convo.say('You are about to enter an FOI request that will be processed by our servers.');

            convo.ask('What is your request?', function(response, convo) {
                convo.say('Hold on while we validate your request');

                if (!wordfilter.blacklisted(response.text)) {
                convo.say('Your request passed our validation process');
                convo.say('Your request is: ' + response.text);
                convo.say('Please wait while we try to find any matches...');

                request.post(
                  'http://localhost:5000/predict',
                  { json: { question: response.text } },
                  function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      if(body.good_match.length == 0){
                        convo.say('We processed your request but could not find any matches');
                      }else{
                        //de aici am inceput sa adaug cod pentru a face conversatia mai complexa.

                        convo.say('Good news. We found a set of possible matches.');
                        convo.say('Here are the most likely matches in order:');

                        for(var i = 0; i < body.good_match.length; i++){
                          var goodMatchFound = 0;

                          convo.say('Here is a possible match:')
                          convo.say(`The title of the response is ${body.good_match[i].title} and the reference number of the pdf is ${body.good_match[i].reference}`);
                          convo.ask(`Was this helpful? Please type "yes" or "no" `, [
                            {
                              pattern: 'yes',
                              callback: function(response, convo){
                                goodMatchFound = 1;
                                convo.gotoThread('yes_thread');
                              }
                            },
                            {
                              pattern: 'no',
                              callback: function(response, convo){
                                convo.gotoThread('no_thread');
                              }
                            },
                            {
                              default: true,
                              callback: function(response,convo){
                                i--;
                                convo.gotoThread('bad_response');
                              }
                            }], {}, 'default')

                            convo.activate();
                            if(goodMatchFound == 1){
                              break;
                            }
                        }
                        // aici am terminat de loop-uit prin arrayul de good_matches.
                        // acuma incerc prin array-ul possible_match;
                        if(body.possible_match.length > 0 && goodMatchFound !=1){
                          convo.say('That was the list of our most likely matches. I can try showing you some other results that I found');
                          for(var i = 0; i < body.possible_match.length; i++){

                            convo.addMessage({
                              text: 'Glad we could help you :) .',
                            }, 'yes_thread');

                            convo.addMessage({
                              text: 'Hmm... Let me try something else.',
                            }, 'no_thread');

                            convo.addMessage({
                              text: 'I am sorry but I cannot process that answer.',
                              action: 'default',
                            }, 'bad_response');

                            var possibleMatchFound = 0;

                            convo.say('Here is a possible match:')
                            convo.say(`The title of the response is ${body.possible_match[i].title} and the reference number of the pdf is ${body.possible_match[i].reference}`);
                            convo.ask(`Was this helpful? Please type "yes" or "no" : `, [
                              {
                                patten: 'yes',
                                callback: function(response, convo){
                                  possibleMatchFound = 1;
                                  convo.gotoThread('yes_thread');
                                }
                              },
                              {
                                pattern: 'no',
                                callback: function(response, convo){
                                  convo.gotoThread('no_thread');
                                }
                              },
                              {
                                default: true,
                                callback: function(response,convo){
                                  i--;
                                  convo.gotoThread('bad_response');
                                }
                              }], {}, 'default')
                              convo.activate();
                              if(possibleMatchFound == 1){
                                break;
                              }
                          }
                        }


                        // here I need to make the convo more complex The reference number is : ' + body.good_match[0].reference

                      }
                    } else {
                      convo.say("Ahh, you got bamboozled again. Couldn't process your request");
                    }
                  }
                );
                convo.next();
            } else {
                convo.say('I am sorry, but I am afraid I can not process that.');
                convo.next();
            }

            });
        });

    });


    controller.hears(['^question$'], 'direct_message,direct_mention,bot_message', function(bot, message) {

        bot.createConversation(message, function(err, convo) {

            // create a path for when a user says YES
            convo.addMessage({
                    text: 'How wonderful.',
            },'yes_thread');

            // create a path for when a user says NO
            // mark the conversation as unsuccessful at the end
            convo.addMessage({
                text: 'Cheese! It is not for everyone.',
                action: 'stop', // this marks the converation as unsuccessful
            },'no_thread');

            // create a path where neither option was matched
            // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
            convo.addMessage({
                text: 'Sorry I did not understand. Say `yes` or `no`',
                action: 'default',
            },'bad_response');

            // Create a yes/no question in the default thread...
            convo.ask('Do you like cheese?', [
                {
                    pattern:  bot.utterances.yes,
                    callback: function(response, convo) {
                        convo.gotoThread('yes_thread');
                    },
                },
                {
                    pattern:  bot.utterances.no,
                    callback: function(response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function(response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);

            convo.activate();

            // capture the results of the conversation and see what happened...
            convo.on('end', function(convo) {

                if (convo.successful()) {
                    // this still works to send individual replies...
                    bot.reply(message, 'Let us eat some!');

                    // and now deliver cheese via tcp/ip...
                }

            });
        });

    });

};


/*
{
    "direct_answer": "",
    "good_match": [
        {
            "date": "03-08-2017",
            "reference": "21016748",
            "title": "Children referred to Channel"
        }
    ],
    "possible_match": [
        {
            "date": "03-08-2017",
            "reference": "21016748",
            "title": "Children referred to Channel"
        },
        {
            "date": "03-08-2017",
            "reference": "21016748",
            "title": "Children referred to Channel"
        }
    ],
    "label": "Information request (FOI/EIR) - Children, schools and families"
}

*/
