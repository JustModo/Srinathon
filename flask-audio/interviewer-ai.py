import ollama
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

# A variable to hold conversation context
conversation_history = []
count = 0


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('message')
def handle_message(data):
    global conversation_history
    global count
    print(f"Received input: {data}")

    if count != 3:

        if not conversation_history:
            system_prompt = (
                "You are an interviewer. Ask only 3 behavioral questions related to leadership qualities, "
                "problem-solving ability, and communication skills. Each question should progressively increase in difficulty. "
                "Start with a simple question to get to know the candidate, then move on to a more challenging one, and finally, "
                "ask a question that requires them to demonstrate a higher level of thinking or experience. For each question, "
                "mention the number of the question (e.g., 'This is Question 1'). Ask questions until satisfied with the answer or a limit of questions is reached. "
                "At the end of the third question, thank the candidate for taking the interview."
            )

            conversation_history.append(
                {'role': 'system', 'content': system_prompt})

        # Add the user's message to the conversation history
        conversation_history.append({'role': 'user', 'content': data})

        # Pass the conversation history (including previous responses) to Ollama
        response = ollama.chat(
            model='llama3.2',
            messages=conversation_history
        )

        # Extract and add the response from Ollama to the conversation history
        conversation_history.append(
            {'role': 'assistant', 'content': response.message.content})

        # Stream the response back to the client
        print(response.message.content)
        emit('response', response.message.content)
        count += 1
    else:
        # Once the third question is completed, generate the summary report
        summary_prompt = (
            "Based on the conversation history, generate a summary report for the candidate's interview. "
            "The report should focus on the candidate's leadership qualities, problem-solving ability, and communication skills. "
            "Provide a brief assessment of whether the candidate should be hired, based on their responses."
        )

        # Add the summary request to the conversation history
        conversation_history.append(
            {'role': 'assistant', 'content': summary_prompt})

        # Pass the conversation history (including the summary request) to Ollama
        response = ollama.chat(
            model='llama3.2',
            messages=conversation_history
        )

        print(response)

        # Extract and add the response from Ollama (the summary) to the conversation history
        conversation_history.append(
            {'role': 'assistant', 'content': response.message.content})

        # Get the summary content
        summary_report = response.message.content

        # Ensure we have content before writing to the file
        if summary_report:
            file_path = "interview_summary.txt"

            # Writing the summary to a text file
            with open(file_path, 'w') as file:
                file.write("Interview Summary Report:\n\n")
                file.write(summary_report)

            print("Summary written to file:", file_path)

            # Stream the summary report back to the client
            emit('response', summary_report)
        else:
            print("No summary was returned. Unable to write to file.")

        # Reset conversation history and count for the next interview
        conversation_history = []
        count = 0


# Start the Flask server with Socket.IO
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
