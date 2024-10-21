const socket = io();
let username;

function joinQuiz() {
    username = document.getElementById('username').value;
    socket.emit('join', { username: username });
    document.getElementById('username').style.display = 'none';
    document.querySelector('button').style.display = 'none';
    document.getElementById('logged-user').textContent = username;
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('waiting-message').style.display = 'block';
    document.getElementById('join-title').style.display = 'none';
}

socket.on('update_participants', (data) => {
    document.getElementById('participant-count').textContent = data.count;
});

socket.on('new_question', (data) => {
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('question-text').innerText = data.question;
    const letters = ['a', 'b', 'c', 'd'];
    const options = data.options.map((opt, index) =>
        `<input type="radio" id="${letters[index]}" name="answer" value="${opt}">
        <label for="${letters[index]}">${letters[index]}) ${opt}</label><br>`
    ).join('');
    document.getElementById('options').innerHTML = options;
});

function submitForm(event) {
    event.preventDefault();
    const answer = document.querySelector('input[name="answer"]:checked').value;
    socket.emit('submit_answer', { answer });
}

function checkAnswers() {
    socket.emit('check_answers');
}

function nextQuestion() {
    socket.emit('next_question');
}

function endQuiz() {
    socket.emit('end_quiz');
}

function restartQuiz() {
    socket.emit('restart_quiz');
}

socket.on('display_results', (data) => {
    const img = `<img src="data:image/png;base64,${data.chart}" alt="Results Chart" />`;
    const resultText = `<p>Correct Answer: ${data.results.correct_answer}</p>`;
    document.getElementById('results').innerHTML = img + resultText;
});

socket.on('enable_end_quiz', () => {
    document.getElementById('end-quiz').disabled = false;
});

socket.on('clear_results', () => {
    document.getElementById('results').innerHTML = '';
});

socket.on('display_final_results', (finalResults) => {
    document.getElementById('quiz-content').style.display = 'none';
    const resultsTable = document.getElementById('results-table');
    resultsTable.innerHTML = '';
    finalResults.forEach((participant) => {
        const row = `<tr><td>${participant.username}</td><td>${participant.score}</td></tr>`;
        resultsTable.innerHTML += row;
    });
    document.getElementById('final-results').style.display = 'block';
});

socket.on('quiz_reset', () => {
    document.getElementById('results').innerHTML = '';
    document.getElementById('question-text').innerText = '';
    document.getElementById('options').innerHTML = '';
    document.getElementById('final-results').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('waiting-message').style.display = 'block';
});
