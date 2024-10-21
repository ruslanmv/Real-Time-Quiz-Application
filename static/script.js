const socket = io();
let username;

function joinQuiz() {
    username = document.getElementById('username').value;
    socket.emit('join', { username: username });
    document.getElementById('quiz-content').style.display = 'block';
    socket.emit('request_question');
}

socket.on('new_question', (data) => {
    document.getElementById('question-text').innerText = data.question;
    const options = data.options.map((opt, index) => 
        `<button onclick="submitAnswer('${opt}')" class="btn btn-secondary">${opt}</button>`
    ).join('');
    document.getElementById('options').innerHTML = options;
});

function submitAnswer(answer) {
    socket.emit('submit_answer', { answer: answer });
}

function nextQuestion() {
    socket.emit('next_question');
}

socket.on('update_results', (data) => {
    let resultsText = '';
    for (let user in data) {
        resultsText += `<p>${user}: ${data[user]}</p>`;
    }
    document.getElementById('results').innerHTML = resultsText;
});

socket.on('quiz_end', () => {
    alert('Quiz has ended!');
});
