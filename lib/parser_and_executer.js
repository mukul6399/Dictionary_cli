const inquirer = require('inquirer');
const Dict = require('./data_structure').Dict;
const Word = require('./data_structure').Word;


function step_1 (word, mesg) {
    let questions = [
        {
            type : 'input',
            name : 'user_answer',
            message : 'Please Guess the word using the provided information ' + mesg
        }
    ];
    inquirer.prompt(questions).then(answers => {
        if (word.is_correct(answers['user_answer'])) {
            console.log("Your Answer Is Correct !");
        } else {
            step_2(word);
        }
    })

}

function step_2 (word) {
    console.log('Your Guess is Incorrect! Please select an option below');
    let questions = [
        {
            type: 'list',
            name: 'option',
            message: 'Which option would you like to select',
            choices: ['Try Again', 'Hint', 'Quit']
        }
    ];

    inquirer.prompt(questions).then(answers => {
       if (answers.option === 'Hint') {
           console.log(word.get_next_hint());
           step_1(word, '');
       } else if (answers.option === 'Try Again') {
           step_1(word, '');
       } else {
           console.log('Word of the Day:', word.name);
           console.log(word.get_properties());
       }
    })
}


function parse_and_execute (argv) {
    const dictionary = new Dict();
    let args = argv.slice(2);
    let promise_fns = [];
    if (args.length === 0) {
        dictionary.word_of_the_day().then((res) => {
            let word = res.word;
            promise_fns =  [dictionary.definition(word), dictionary.synonyms(word), dictionary.antonyms(word), dictionary.examples(word)];
            Promise.all(promise_fns)
               .then(function(values) {
                   values.forEach((item) => {
                       console.log(item);
                   });
               })
               .catch(function(err) {
                   console.log('Some Error Occured! Try Again');
               });
       });
   } else if (args.length === 1 && args[0] === 'play') {
       dictionary.word_of_the_day().then((res) => {
           let word = res.word;
           promise_fns =  [dictionary.definition(word), dictionary.synonyms(word), dictionary.antonyms(word), dictionary.examples(word)];
           Promise.all(promise_fns)
               .then(function(values) {
                   let fetched_word = new Word(word, values);
                   let data = fetched_word.first_info;
                   let mesg = '  ';
                   for (let key in data) {
                       mesg += '{' + key.toString() + '  :  ' + data[key] + '}  '
                   }
                   step_1(fetched_word, mesg);

               })
               .catch(function(err) {
                   console.log('Some Error Occured! Try Again');
               });
       });
   } else if (args.length === 1) {
       promise_fns = [dictionary.definition(args[0]), dictionary.synonyms(args[0]), dictionary.antonyms(args[0]), dictionary.examples(args[0])];
   } else if (args.length === 2) {
       switch (args[0]) {
           case 'defn':
               promise_fns= [dictionary.definition(args[1])];
               break;
           case 'syn':
               promise_fns = [dictionary.synonyms(args[1])];
               break;
           case 'ant':
               promise_fns = [dictionary.antonyms(args[1])];
               break;
           case 'ex':
               promise_fns = [dictionary.examples(args[1])];
               break;
       }
   }

   if (args.length !== 0) {
       Promise.all(promise_fns)
           .then(function(values) {
               values.forEach((item) => {
                   console.log(item);
               });
           })
           .catch(function(err) {
               console.log('Some Error Occured! Try Again');
           });
   }
}


module.exports = {
    parse_and_execute
};