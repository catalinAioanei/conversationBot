var request = require('request');
var wordfilter = require('wordfilter');
wordfilter.addWords(['zebra','elephant']);

module.exports = function(controller) {

    controller.hears('request', 'message_received', function(bot, message) {

        bot.startConversation(message, function(err, convo) {

          convo.addMessage({
            text: 'Glad we could help you :) .',
            action: 'completed'
          }, 'yes_thread');

            convo.say('You are about to enter an FOI request that will be processed by our servers.');

            convo.ask('What is your request?', function(response, convo) {
                convo.say('Hold on while we validate your request');

                if (!wordfilter.blacklisted(response.text)) {
                convo.say('Your request passed our validation process');
                convo.say('Your request is: ' + response.text);
                convo.say('Please wait while we try to find any matches...');

                request.post(
                  'http://51.143.153.18:5000/predict',
                  { json: { question: response.text } },
                  function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      if(body.good_match.length == 0 && body.possible_match.length == 0){
                        convo.say('We processed your request but could not find any matches');
                      }else{
                        convo.say('Good news. We found a set of possible matches.');
                        convo.say('Here are the most likely matches in order:');

                        for(var i = 0; i < body.good_match.length; i++){
                          var goodMatchFound = 0;
                          if(i == 0){
                            convo.say('Here is a good match:')
                          } else {
                            convo.say('Here is another good match:')
                          }
                          convo.say(`The title of the response is ${body.good_match[i].title} and the reference number of the pdf is ${body.good_match[i].reference}`);
                          convo.say({
                            text: 'Click here for more information:',
                            link_title: body.good_match[i].title,
                            open_link: body.good_match[i].link,
                          });

                          convo.addQuestion(`Was this helpful? Please type "yes" or "no" `,
                          [
                            {
                              pattern: bot.utterances.yes,
                              callback: function(response_message, convo) {
                                convo.gotoThread('yes_thread');
                                convo.next();
                              }
                            },
                            {
                              pattern: bot.utterances.no,
                              callback: function(response_message, convo) {
                                convo.sayFirst('Hmmm... Let me try something else');
                                convo.next();
                              }
                            },
                            {
                              default: true,
                              callback: function(response_message, convo) {
                                convo.sayFirst('I could not process that answer. I will move on...');
                                convo.next();
                              }
                            }
                          ],{},'default');

                        }
                        // aici am terminat de loop-uit prin arrayul de good_matches.
                        // acuma incerc prin array-ul possible_match;
                        if(body.good_match.length == 0){
                          convo.say("I am sorry but I could not come up with any good matches. ");
                        }else{
                          convo.say("That was the list of our most likely matches. ");
                        }
                        if(body.possible_match.length > 0 && goodMatchFound !=1){
                          convo.say('I can try showing you some other similar results that I found');
                          for(var i = 0; i < body.possible_match.length; i++){

                            if(i == 0){
                              convo.say('Here is a possible match:')
                            } else {
                              convo.say('Here is another possible match:')
                            }
                            convo.say(`The title of the response is ${body.possible_match[i].title} and the reference number of the pdf is ${body.possible_match[i].reference}`);

                            convo.say({
                              text: 'Click here for more information:',
                              link_title: body.possible_match[i].title,
                              open_link: body.possible_match[i].link,
                            });

                            convo.addQuestion(`Was this helpful? Please type "yes" or "no" `,
                            [
                              {
                                pattern: bot.utterances.yes,
                                callback: function(response_message, convo) {
                                  convo.gotoThread('yes_thread');
                                  convo.next();
                                }
                              },
                              {
                                pattern: bot.utterances.no,
                                callback: function(response_message, convo) {
                                  convo.sayFirst('Hmmm... Let me try something else');
                                  convo.next();
                                }
                              },
                              {
                                default: true,
                                callback: function(response_message, convo) {
                                  convo.sayFirst('I could not process that answer.');
                                  i--;
                                  convo.next();
                                }
                              }
                            ],{},'default');
                          }
                        }

                        convo.say(`I am sorry, but it seems you reached the end of my suggestions. In order to have your request answered, you'll have to email it directly to Camden. You can do that by typing 'email'.`);

                      }
                    } else {
                      convo.say("We are sorry but we couldn't process your request. Something could be wrong with our servers. Try submitting your request at a later time.");
                      console.log(error);
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
            'link': ''
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
