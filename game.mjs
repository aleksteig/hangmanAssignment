//#region Dont look behind the curtain
// Do not worry about the next two lines, they just need to be there. 
import * as readlinePromises from 'node:readline/promises';
const rl = readlinePromises.createInterface({ input: process.stdin, output: process.stdout });

async function askQuestion(question) {
    return await rl.question(question);
}

//#endregion

import { ANSI } from './ansi.mjs';
import { HANGMAN_UI } from './graphics.mjs';
import { emitKeypressEvents } from 'node:readline';
import { exit } from 'node:process';



let listOfWords = ["Cat", "Dog", "Fish", "Bird", "Fruit", "Llama", "Orange", "Potato", "Chess", "Plane", "Computer", "Bag"].map(function(v) {
    return v.toLowerCase();
});
function rand(min, max) {
    let offset = min;
    let range = (max - min) +1;

    let randomNumber = Math.floor( Math.random() * range) + offset;
    return randomNumber;
}

function restartGame() {
    isGameOver = false;
    wasGuessCorrect = false;
    wrongGuesses = [];
    randomWord = pickRandomWordFrom(listOfWords);
    guessedWord = "".padStart(randomWord.length, "_");
    numberOfCharInWord = randomWord.length;
}

let randomWord = pickRandomWordFrom(listOfWords);
let numberOfCharInWord = randomWord.length;
let guessedWord = "".padStart(randomWord.length, "_"); // "" is an empty string that we then fill with _ based on the number of char in the correct word.
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];
let exitGame = false;
function gameIsRunning() {
    return exitGame == false;
}
function pickRandomWordFrom (wordList){
    let randomNumber = rand(0, wordList.length - 1);
    return wordList[randomNumber];

}

//wordDisplay += ANSI.COLOR.GREEN;
while (gameIsRunning()) {
    function drawWordDisplay() {

        wordDisplay = "";

        for (let i = 0; i < numberOfCharInWord; i++) {
            if (guessedWord[i] != "_") {
                wordDisplay += ANSI.COLOR.GREEN;
            }
            wordDisplay = wordDisplay + guessedWord[i] + " ";
            wordDisplay += ANSI.RESET;
        }

        return wordDisplay;
    }

    function createColouredStringFromList(list, color) {
        list = Array.from(list);
        let output = color;
        for (let i = 0; i < list.length; i++) {
            output += list[i] + " ";
        }

        return output + ANSI.RESET;
    }

    // Continue playing until the game is over. 
    while (isGameOver == false) {

        console.log(ANSI.CLEAR_SCREEN);
        console.log(drawWordDisplay());
        console.log(createColouredStringFromList(new Set(wrongGuesses), ANSI.COLOR.RED));
        console.log(HANGMAN_UI[wrongGuesses.length]);

        const answer = (await askQuestion("Guess a char or the word : ")).toLowerCase();

        if (answer == randomWord) {
            isGameOver = true;
            wasGuessCorrect = true;
            guessedWord = answer;
        } else if (ifPlayerGuessedLetter(answer) == false) {
            let isCorrect = false;
            if (answer != randomWord) {
                isCorrect = false;
                wrongGuesses.push(answer);
            }
        } else if (ifPlayerGuessedLetter(answer)) {

            let org = guessedWord;
            guessedWord = "";

            let isCorrect = false;
            for (let i = 0; i < randomWord.length; i++) {
                if (randomWord[i] == answer) {
                    if (guessedWord[i] == answer) {
                        isCorrect = false;
                    } else {
                        guessedWord += answer;
                        isCorrect = true;
                    }
                } else {
                    // If the currents answer is not what is in the space, we should keep the char that is allready in that space. 
                    guessedWord += org[i];
                }
            }

            if (isCorrect == false) {
                wrongGuesses.push(answer);
            } else if (guessedWord == randomWord) {
                isGameOver = true;
                wasGuessCorrect = true;
            }
        }

        // Read as "Has the player made to many wrong guesses". 
        // This works because we cant have more wrong guesses then we have drawings. 
        if (wrongGuesses.length == HANGMAN_UI.length - 1) {
            isGameOver = true;
        }

    }

    // OUR GAME HAS ENDED.

    console.log(ANSI.CLEAR_SCREEN);
    console.log(drawWordDisplay());
    console.log(createColouredStringFromList(wrongGuesses, ANSI.COLOR.RED));
    console.log(HANGMAN_UI[wrongGuesses.length]);

    if (wasGuessCorrect) {
        console.log(ANSI.COLOR.YELLOW + "Congratulations, winner winner chicken dinner");
    }

    console.log("Game Over");
    let continuePlaying = await askQuestion("Do you want to continue(y/N)? : ");
    


    if(continuePlaying[0].toLowerCase() != "y"){
         exitGame = true; 
    } 
    
    restartGame();        
    
}

process.exit();

function ifPlayerGuessedLetter(answer) {
    return answer.length == 1
}

