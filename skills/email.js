const nodemailer = require('nodemailer');
const emailjs = require('emailjs');
const xoauth2 = require('xoauth2');
const validator = require('validator');
const wordfilter = require('wordfilter');
wordfilter.addWords(['zebra','elephant']);

module.exports = function(controller) {

  controller.hears(['^email$'],'message_received', function(bot, message) {
    bot.startConversation(message, function(err, convo) {
      convo.say('You are about to send an email to the Camden Council with an FOI request.');
      convo.ask('What is your request?' , function(response, convo){
        convo.say('Please wait while we validate your request... ');

        if(wordfilter.blacklisted(response.text)) {
          convo.say('do not use swearwords');
        }else{
          convo.say('Your request passed our validation.');
          var request = response.text;
          convo.ask('Please enter your email address', function (response,convo){
            convo.say('You entered the following address: ' + response.text);
            if(!validator.isEmail(response.text)){
              convo.say('That is not a valid email address');
            }else{
              convo.say('That is a valid email address');
              var sender_email = response.text;

              // here we begin doing the part for sending the actual email :)



              //var email 	= require("./node_modules/emailjs/email");
              var server 	= emailjs.server.connect({
                user:    "systemsEngTeam12@gmail.com",
                password:"systemsEngTeam12",
                host:    "smtp.gmail.com",
                ssl:     true
              });

    // send the message and get a callback with an error or details of the message that was sent
              server.send({
                text:    request,
                from:    'FOI_Request Service',
                to:      "Catalin <cata_aioanei@yahoo.com>",
                cc: '',
                subject: "FOI Request from " + sender_email,
              }, function(err, message) {
                if(err) {
                  console.log(err);
                  convo.say('We are sorry, but something happened while trying to send your email');
                } else {
                  convo.say('All good. Your email has been sent');
                }
              });

              // finised :)
            }
            convo.next();
          });
        }

        convo.next();

      });
    })
  });

}

//systemsEngTeam12@gmail.com
//systemsEngTeam12
