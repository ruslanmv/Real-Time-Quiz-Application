from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

# Store questions and participants
questions = [
    {"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Rome"]},
    {"question": "What is the largest planet?", "options": ["Earth", "Mars", "Jupiter", "Saturn"]}
]
current_question = {"index": 0, "answers": {}}
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
    participants[request.sid] = username
    join_room('quiz')
    emit('update_participants', participants, room='quiz')
    print(f"{username} joined the quiz.")

@socketio.on('disconnect')
def on_leave():
    if request.sid in participants:
        username = participants[request.sid]
        leave_room('quiz')
        del participants[request.sid]
        emit('update_participants', participants, room='quiz')
        print(f"{username} left the quiz.")

@socketio.on('request_question')
def send_question():
    index = current_question['index']
    question = questions[index]
    emit('new_question', question, room=request.sid)

@socketio.on('submit_answer')
def receive_answer(data):
    username = participants.get(request.sid, "Unknown")
    answer = data['answer']
    current_question['answers'][username] = answer
    emit('update_results', current_question['answers'], room='quiz')

@socketio.on('next_question')
def next_question():
    current_question['index'] += 1
    current_question['answers'] = {}
    if current_question['index'] < len(questions):
        question = questions[current_question['index']]
        emit('new_question', question, room='quiz')
    else:
        emit('quiz_end', room='quiz')

if __name__ == '__main__':
    socketio.run(app, debug=True)
