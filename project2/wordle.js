// TURAN TASHKIN
// 07-09-2026
// TORDLE


// letter status: 0 = not used, 1 = yellow, 2 = green, -1 = incorrect
let letterStatus = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, 
                "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "P": 0, "Q": 0, "R": 0, "S": 0, "T": 0, 
                "U": 0, "V": 0, "W": 0, "X": 0, "Y": 0, "Z": 0 }

let potentialWords = ["BOAST", "LEVER", "STYLE", "FLOAT", "TRADE", "GLIDE", "POURS", "GLEAM", "PLATE", "GLASS",
                      "DRIVE", "HIVES", "TOUGH", "GREAT", "DREAM", "SCRAP", "ALONE", "LASER", "TOKEN", "PLEAT", 
                      "ZEBRA", "TAXES", "PEACH", "BLACK", "PINKY", "CHAIR", "PLANT", "DRINK", "HAPPY", "HARDY"
];

// variables that handle current word
let wordSpot = Math.round(Math.random() * 30 + 0.5);
let currentWord = potentialWords[wordSpot] || 'SHINE';
console.log("Current word: ", currentWord);

let guessWord = '';
let guessArray = []
let currentRow = 1;
let correctLetters = 0;

// handle the end game
function endGame(){
    document.getElementById('endGame').classList.remove('hidden');
}

// color the letters of the word based on status
function colorWords() {

    let wordSplit = currentWord.split('');
    let guessSplit = guessWord.split('');

    // check if there's any green
    for(let i = 0; i < 5; i++) {
        if(wordSplit[i] == guessSplit[i]){
            correctLetters += 1;
            document.getElementById(`letter${currentRow}${i + 1}`).style.backgroundColor = 'green';
            document.getElementById(`letter${guessSplit[i]}`).style.backgroundColor = 'green';
            letterStatus[guessSplit[i]] = 2;
            wordSplit[i] = null;
        }
    }

    // check for any yellows. get rid of used letters to find duplicates
    for(let i = 0; i < 5; i++) {
        if(guessSplit[i] !== null) {
            let found = false;

            // iterate through the guess and current word to find any remaining duplicates and color yellow if any
            for(let j = 0; j < 5; j++) {
                if(wordSplit[j] !== null && guessSplit[i] == wordSplit[j]) {

                    document.getElementById(`letter${currentRow}${i + 1}`).style.backgroundColor = 'yellow';
                    if(letterStatus[guessSplit[i]] !== 2) {
                        letterStatus[guessSplit[i]] = 1;
                        document.getElementById(`letter${guessSplit[i]}`).style.backgroundColor = 'yellow';
                    }

                    wordSplit[j] = null;
                    found = true;
                    break;
                }
            }

            // color gray for used letters
            if(!found && letterStatus[guessSplit[i]] < 1) {
                letterStatus[guessSplit[i]] = -1;
                document.getElementById(`letter${guessSplit[i]}`).style.backgroundColor = 'gray';
            }
        }
    }
}

// handle guess checking
function setWord() {
    document.getElementById('statement').textContent = '';
    guessWord = document.getElementById('guessWord').value.toUpperCase().trim();
    correctLetters = 0;
    
    // only use valid words
    if(guessWord.length != 5){
        document.getElementById('statement').textContent = 'Only use 5-letter words.';
        return;
    }

    // check the letters of the guess and current word
    for(let i = 0; i < 5; i++){
        // make sure all characters are letters
        if(guessWord[i] == guessWord[i].toLowerCase()){
            document.getElementById('statement').textContent = 'Use valid characters only.';
            return;
        }

        document.getElementById(`letter${currentRow}${i + 1}`).textContent = guessWord[i];
    }

    colorWords();
    currentRow += 1;

    // handle the win
    if(correctLetters == 5){
        document.getElementById('statement').textContent = `YOU WIN! THE WORD WAS ${currentWord}.`;
        endGame();
    }

    // handle the loss
    if(currentRow > 6) {
        document.getElementById('statement').textContent = `GAME OVER! THE WORD WAS ${currentWord}.`;
        endGame();
    }
}


document.getElementById('sendWord').addEventListener('click', setWord);
document.getElementById('yes').addEventListener('click', function() {
    location.reload();
});
