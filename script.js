const RANDOM_JOKE_API = 'https://v2.jokeapi.dev/joke/Any?blacklistFlags=religious,political,sexist';
const jokeDisplayElement = document.getElementById('jokeDisplay');
const jokeInputElement = document.getElementById('jokeInput');
const timerElement = document.getElementById('timer');
const jokeContainer = document.getElementById('jokeContainer');
const resultContainer = document.getElementById('resultContainer');
const resultDisplay = document.getElementById('resultDisplay');
const nextJokeButton = document.getElementById('nextJokeButton');

let timerInterval;
let startTime;
let totalCharacters = 0;
let correctCharacters = 0;
let totalTypedCharacters = 0; // Total characters typed by the user

// Start the timer when the user starts typing for the first time
jokeInputElement.addEventListener('input', startTimerOnFirstInput);

function startTimerOnFirstInput() {
    startTimer();
    jokeInputElement.removeEventListener('input', startTimerOnFirstInput);
    jokeInputElement.addEventListener('input', handleTyping);
}

function handleTyping() {
    const arrayJoke = jokeDisplayElement.querySelectorAll('span');
    const arrayValue = jokeInputElement.value.split('');
    correctCharacters = 0; // Reset correct character count

    arrayJoke.forEach((characterSpan, index) => {
        const character = arrayValue[index];
        if (character == null) {
            characterSpan.classList.remove('incorrect');
            characterSpan.classList.remove('correct');
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
            correctCharacters++; // Increment correct character count
        } else {
            characterSpan.classList.remove('correct');
            characterSpan.classList.add('incorrect');
        }
    });

    // Total characters typed by the user
    totalTypedCharacters = arrayValue.length;

    // Ensure next joke is rendered only when the current joke is fully typed correctly
    if (totalTypedCharacters === arrayJoke.length) {
        showResult();
    }
}

async function getRandomJoke() {
    try {
        const response = await fetch(RANDOM_JOKE_API);
        const data = await response.json();
        if (data.type === "single") {
            return data.joke;
        } else if (data.type === "twopart") {
            return `${data.setup} - ${data.delivery}`;
        }
    } catch (error) {
        console.error("Failed to fetch joke:", error);
        return "Sorry, couldn't fetch a joke at the moment.";
    }
}

async function renderNextJoke() {
    const joke = await getRandomJoke();
    jokeDisplayElement.innerHTML = '';
    totalCharacters = joke.length; // Set total character count
    joke.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        jokeDisplayElement.appendChild(characterSpan);
    });
    jokeInputElement.value = null;
    startTime = null; // Reset start time for the next joke
    jokeInputElement.addEventListener('input', startTimerOnFirstInput); // Re-add the event listener
    jokeContainer.style.display = 'block';
    resultContainer.style.display = 'none';
}

function showResult() {
    const timeTaken = getTimerTime(); // Time taken in seconds
    const accuracy = (correctCharacters / totalTypedCharacters) * 100; // Accuracy in percentage
    const wpm = (totalTypedCharacters / 5) / (timeTaken / 60); // Words per minute (average word length is 5 characters)

    resultDisplay.innerHTML = `
        <p>Accuracy: ${accuracy.toFixed(2)}%</p>
        <p>Typing Speed: ${wpm.toFixed(2)} WPM</p>
    `;
    jokeContainer.style.display = 'none';
    resultContainer.style.display = 'block';
}

nextJokeButton.addEventListener('click', renderNextJoke);

function startTimer() {
    if (!startTime) {
        startTime = new Date();
        timerInterval = setInterval(() => {
            timerElement.innerText = getTimerTime();
        }, 1000);
    }
}

function getTimerTime() {
    return Math.floor((new Date() - startTime) / 1000);
}

renderNextJoke();
