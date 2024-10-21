from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

questions = [
    {"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Rome"], "correct": "Paris"},
    {"question": "What is the largest planet?", "options": ["Earth", "Mars", "Jupiter", "Saturn"], "correct": "Jupiter"}
]
initial_questions = questions.copy()  # Keep a copy of the original questions to reset later
current_question = {"index": 0, "answers": {}, "started": False}
participants = {}

@app.route('/')
def index():
    return "Welcome to the Quiz App"

@app.route('/client')
def client():
    return render_template('client.html')

@app.route('/host')
def host():
    return render_template('host.html')

@socketio.on('join')
def on_join(data):
    username = data['username']
    user_id_number = random.randint(1000, 9999)  # Generate a unique ID for the user
    participants[request.sid] = {"user_id_number": user_id_number, "username": username, "score": 0}
    join_room('quiz')
    emit('update_participants', {"participants": participants, "count": len(participants)}, room='quiz')
    print(f"{username} (ID: {user_id_number}) joined the quiz.")

@socketio.on('disconnect')
def on_leave():
    if request.sid in participants:
        username = participants[request.sid]["username"]
        leave_room('quiz')
        del participants[request.sid]
        emit('update_participants', {"participants": participants, "count": len(participants)}, room='quiz')
        print(f"{username} left the quiz.")

@socketio.on('start_quiz')
def start_quiz():
    reset_quiz()  # Reset the quiz state before starting
    current_question['started'] = True
    index = current_question['index']
    if index < len(questions):
        question = questions[index]
        emit('new_question', question, room='quiz')

@socketio.on('submit_answer')
def receive_answer(data):
    username = participants[request.sid]["username"]
    answer = data['answer']
    current_question['answers'][username] = answer
    if len(current_question['answers']) == len(participants):
        emit('all_answers_received', room='quiz')

@socketio.on('check_answers')
def check_answers():
    index = current_question['index']
    if index < len(questions):
        question = questions[index]
        correct_answer = question['correct']
        results = {
            "question": question["question"],
            "answers": current_question["answers"],
            "correct_answer": correct_answer
        }

        # Generate the chart and encode it as base64
        chart_base64 = generate_chart(current_question["answers"], question["options"])
        emit('display_results', {"results": results, "chart": chart_base64}, room='quiz')

        # Update scores based on user_id_number
        for sid, participant in participants.items():
            if current_question['answers'].get(participant["username"]) == correct_answer:
                participants[sid]["score"] += 1

@socketio.on('next_question')
def next_question():
    current_question['index'] += 1
    current_question['answers'] = {}
    if current_question['index'] < len(questions):
        question = questions[current_question['index']]
        emit('clear_results', room='quiz')  # Clear previous results and plot
        emit('new_question', question, room='quiz')
    else:
        final_results = calculate_final_results()
        emit('quiz_end', final_results, room='quiz')

@socketio.on('restart_quiz')
def restart_quiz():
    reset_quiz()
    emit('quiz_reset', room='quiz')

def generate_chart(answers, options):
    counts = [list(answers.values()).count(option) for option in options]
    plt.figure(figsize=(6, 4))
    plt.bar(options, counts)
    plt.xlabel('Options')
    plt.ylabel('Number of Votes')
    plt.title('Results')
    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    chart_base64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close()
    return chart_base64

def calculate_final_results():
    results = {participant["username"]: participant["score"] for participant in participants.values()}
    return results

def reset_quiz():
    global questions, current_question
    questions = initial_questions.copy()
    current_question = {"index": 0, "answers": {}, "started": False}
    for participant in participants.values():
        participant["score"] = 0

if __name__ == '__main__':
    socketio.run(app, debug=True)
