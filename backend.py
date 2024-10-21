import os
import json

# Function to load question sets from the "questions" directory
def load_question_sets(directory='questions'):
    question_sets = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".json"):
                question_sets.append(file[:-5])  # Remove the ".json" extension
    return question_sets

# Function to select and load the specified exam
def select_exam(exam_name):
    file_path = os.path.join('questions', f'{exam_name}.json')
    try:
        with open(file_path, 'r') as f:
            questions = json.load(f)
            print(f"Loaded {len(questions)} questions from {exam_name}")
            return questions
    except FileNotFoundError:
        print(f"File {file_path} not found.")
        return []  # Return an empty list if the file is not found
