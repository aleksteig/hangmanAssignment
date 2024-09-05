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
const continuePlayingText = "Do you want to continue(y/N)? : ";
const winnerMessage = "Congratulations, winner winner chicken dinner";
const roundFinishedText = "Game Over";
const guessCharOrWordText = "Guess a char or the word : ";
const addWinToList = "Win";
const addLossToList = "Loss";
const continuePlayingLetter = "y";

let randomWord = pickRandomWordFrom(listOfWords);
let numberOfCharInWord = randomWord.length;
let guessedWord = "".padStart(randomWord.length, "_");
let wordDisplay = "";
let isGameOver = false;
let wasGuessCorrect = false;
let wrongGuesses = [];
let stats = [];
let exitGame = false;
function gameIsRunning() {
    return exitGame == false;
}
function pickRandomWordFrom (wordList){
    let randomNumber = rand(0, wordList.length - 1);
    return wordList[randomNumber];

}

while (gameIsRunning()) {

    function drawHangman() {
        console.log(ANSI.CLEAR_SCREEN);
        console.log(drawCorrectWordDisplayed());
        console.log(createColouredStringFromList(new Set(wrongGuesses), ANSI.COLOR.RED));
        console.log(HANGMAN_UI[wrongGuesses.length]);
    }

    function drawCorrectWordDisplayed() {

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

    while (isGameOver == false) {

        drawHangman();

        const answer = (await askQuestion(guessCharOrWordText)).toLowerCase();

        if (answer == randomWord) {
            isGameOver = true;
            wasGuessCorrect = true;
            guessedWord = answer;
            stats.push(addWinToList);
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
                    if ( org[i] == answer) {
                        isCorrect = false;
                        wrongGuesses.push(answer);
                        guessedWord += org[i];
                    
                    } else {
                        guessedWord += answer;
                        isCorrect = true;
                        
                    }
                } else { 
                    guessedWord += org[i];
                }
            }

            if (isCorrect == false) {
                wrongGuesses.push(answer);
            } else if (guessedWord == randomWord) {
                isGameOver = true;
                wasGuessCorrect = true;
                
                stats.push(addWinToList);
            }
        }

        if (wrongGuesses.length == HANGMAN_UI.length - 1) {
            isGameOver = true;
            
            stats.push(addLossToList);
            
        }

    }

    drawHangman();

    if (wasGuessCorrect) {
        console.log(ANSI.COLOR.YELLOW + winnerMessage);
    }
    
    console.log(roundFinishedText);
    let continuePlaying = await askQuestion(continuePlayingText);

    if(continuePlaying[0].toLowerCase() != continuePlayingLetter){
         exitGame = true; 
    } 
    
    restartGame();        
    
}

console.log(stats);
process.exit();

function ifPlayerGuessedLetter(answer) {
    return answer.length == 1
}
