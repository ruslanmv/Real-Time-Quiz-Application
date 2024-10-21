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
}

socket.on('update_participants', (data) => {
    document.getElementById('participant-count').textContent = data.count;
});

socket.on('new_question', (data) => {
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('question-text').innerText = data.question;
    const options = data.options.map((opt) =>
        `<button onclick="submitAnswer('${opt}')" class="btn btn-secondary">${opt}</button>`
    ).join('');
    document.getElementById('options').innerHTML = options;
});

function submitAnswer(answer) {
    socket.emit('submit_answer', { answer: answer });
}

function startQuiz() {
    socket.emit('start_quiz');
}

function checkAnswers() {
    socket.emit('check_answers');
}

function nextQuestion() {
    socket.emit('next_question');
}

function restartQuiz() {
    socket.emit('restart_quiz');
}

socket.on('display_results', (data) => {
    const img = `<img src="data:image/png;base64,${data.chart}" alt="Results Chart" />`;
    const resultText = `<p>Correct Answer: ${data.results.correct_answer}</p>`;
    document.getElementById('results').innerHTML = img + resultText;
});

socket.on('clear_results', () => {
    document.getElementById('results').innerHTML = '';
});

socket.on('quiz_end', (finalResults) => {
    let resultHtml = '<h3>Final Results</h3>';
    for (let user in finalResults) {
        resultHtml += `<p>${user}: ${finalResults[user]} correct answers</p>`;
    }
    document.getElementById('results').innerHTML = resultHtml;
});

socket.on('quiz_reset', () => {
    document.getElementById('results').innerHTML = '';
    document.getElementById('question-text').innerText = '';
    document.getElementById('options').innerHTML = '';
});
