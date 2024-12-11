from flask import Flask, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from ollama import chat
import os

# Initialize Flask and SocketIO
app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", binary=True)

# Socket.IO Events


@app.route("/")
def index():
    return send_from_directory('.', 'index.html')


socketio = SocketIO(app, cors_allowed_origins="*")

# Ollama Interviewer Process


def ollama_interviewer(user_input):
    system_prompt = (
        "You are an interviewer. Ask 3 proper questions for a behavioral round, like those related to "
        "themselves, hobbies, visions, challenges, etc., to determine leadership qualities, "
        "problem-solving ability, and communication skills. After asking the questions, thank the user for taking the interview. "
        "Ask questions until satisfied with the answer or a limit of questions is reached."
    )

    max_questions = 3
    question_count = 0
    candidate_responses = []

    try:
        # Initialize conversation with the system prompt
        response_stream = chat(
            model='llama3.2',
            messages=[{'role': 'system', 'content': system_prompt},
                      {'role': 'user', 'content': user_input}],
            stream=True
        )

        # Emit initial AI response (start of the interview)
        for response in response_stream:
            emit('output', {
                 'response': response['message']['content']}, broadcast=True)

        while question_count < max_questions:
            # Generate the next question
            question_stream = chat(
                model='llama3.2',
                messages=[{'role': 'system', 'content': system_prompt}, {
                    'role': 'user', 'content': "Ask the next question."}],
                stream=True
            )
            question = ""
            for chunk in question_stream:
                question += chunk['message']['content']
                emit('output', {
                     'response': chunk['message']['content']}, broadcast=True)

            # Here you'd collect the candidate's answer (mocked for demonstration)
            answer = input("Candidate: ")
            candidate_responses.append(
                {"question": question, "answer": answer})

            # Evaluate the candidate's response
            evaluation_stream = chat(
                model='llama3.2',
                messages=[{'role': 'system', 'content': system_prompt}, {
                    'role': 'user', 'content': answer}],
                stream=True
            )
            evaluation = ""
            for chunk in evaluation_stream:
                evaluation += chunk['message']['content']
                emit('output', {
                     'response': chunk['message']['content']}, broadcast=True)

            # Check for "Satisfied" in the evaluation
            if "Satisfied" in evaluation:
                emit('output', {
                     'response': "Interviewer: Thank you for your time!"}, broadcast=True)
                break

            question_count += 1

        # If the loop exits because max questions are reached, end the interview
        if question_count == max_questions:
            emit('output', {
                 'response': "Interviewer: Thank you for your responses! The interview is now over."}, broadcast=True)

        # Generate and save the report
        report_prompt = (
            "Based on the following conversation, generate a detailed report analyzing the candidate's "
            "leadership qualities, problem-solving ability, and communication skills: \n" +
            str(candidate_responses)
        )
        report_stream = chat(
            model='llama3.2',
            messages=[{'role': 'system', 'content': system_prompt},
                      {'role': 'user', 'content': report_prompt}],
            stream=True
        )
        report_content = "".join([chunk['message']['content']
                                 for chunk in report_stream])

        report_path = os.path.join("reports", "candidate_report.txt")
        os.makedirs(os.path.dirname(report_path), exist_ok=True)
        with open(report_path, "w") as report_file:
            report_file.write(report_content)

        print(f"Report saved to {report_path}")

    except Exception as e:
        emit('output', {'response': f"Error: {str(e)}"}, broadcast=True)
# Socket.IO Events


@socketio.on('input', namespace='/')
def handle_input_event(data):
    user_input = data.get('message', '')
    if user_input:
        ollama_interviewer(user_input)


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=8000)
