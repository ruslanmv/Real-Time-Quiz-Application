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

function submitForm(event) {
    event.preventDefault();
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        const answer = selectedOption.value;
        socket.emit('submit_answer', { answer });
    } else {
        alert("Please select an option before submitting.");
    }
}

function selectExam() {
    const examName = document.getElementById('exam-selector').value;
    const startQuestion = document.getElementById('start-question-number').value;
    document.getElementById('question-start-display').textContent = `Starting from question ${startQuestion}.`;
}

function loadQuiz() {
    const examName = document.getElementById('exam-selector').value;
    const startQuestion = document.getElementById('start-question-number').value;
    socket.emit('load_quiz', { exam_name: examName, start_question: parseInt(startQuestion) });
}

function updateSliderValue(value) {
    document.getElementById('start-question').value = value;
    document.getElementById('start-question-number').value = value;
    document.getElementById('question-start-display').textContent = `Starting from question ${value}.`;
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

function endQuiz() {
    socket.emit('end_quiz');
}

function restartQuiz() {
    socket.emit('restart_quiz');
}

socket.on('quiz_loaded', (data) => {
    if (data.success) {
        alert(`Quiz loaded with ${data.num_questions} questions, starting from question ${data.start_question}.`);
    } else {
        alert(`Failed to load quiz.`);
    }
});

socket.on('new_question', (data) => {
    document.getElementById('waiting-message').style.display = 'none';
    document.getElementById('question-text').innerText = data.question;
    // Dynamically generate letters for options (up to 'h')
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']; 
    const options = data.options.map((opt, index) =>
        `<input type="radio" id="${letters[index]}" name="answer" value="${opt}">
         <label for="${letters[index]}">${letters[index]}) ${opt}</label><br>`
    ).join('');
    document.getElementById('options').innerHTML = options;
});

socket.on('display_results', (data) => {
    const img = `<img src="data:image/png;base64,${data.chart}" alt="Results Chart" />`;
    const resultText = `<p>Correct Answer: ${data.results.correct_answer}</p>`;
    document.getElementById('results').innerHTML = img + resultText;
});

socket.on('enable_end_quiz', () => {
    document.getElementById('end-quiz').disabled = false; // Enable the "End Quiz" button
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