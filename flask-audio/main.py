from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import io
from pydub import AudioSegment
import speech_recognition as sr

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

CORS(app, resources={r"*": {"origins": "*"}})  # Allow all origins
socketio = SocketIO(app, cors_allowed_origins="*", binary=True)

audio_buffer = io.BytesIO()  # Buffer to hold incoming audio data


@app.route('/')
def index():
    return render_template('index.html')  # Serve the HTML page


@socketio.on("start_stream", namespace="/audio")
def start_stream():
    global audio_buffer
    audio_buffer = io.BytesIO()  # Clear the buffer to start fresh
    print("Started streaming audio...")


@socketio.on("stream", namespace="/audio")
def stream_audio(data):
    global audio_buffer
    audio_buffer.write(data)  # Append the binary chunk to the buffer
    print(f"Received audio chunk: {len(data)} bytes")


@socketio.on("stop_stream", namespace="/audio")
def stop_stream():
    global audio_buffer
    try:
        audio_buffer.seek(0)
        audio_segment = AudioSegment.from_file(audio_buffer, format="webm")

        wav_file_path = "temp_audio.wav"
        audio_segment.export(wav_file_path, format="wav")

        print(f"Audio saved to {wav_file_path}")
        print_sr()
    except Exception as e:
        print(f"Error during audio processing: {e}")


def print_sr():
    recognizer = sr.Recognizer()

    # Load the audio file
    with sr.AudioFile('temp_audio.wav') as source:
        # Adjust for ambient noise and record
        recognizer.adjust_for_ambient_noise(source)
        audio_data = recognizer.record(source)

    try:
        # Use the Whisper model for recognition
        text = recognizer.recognize_whisper(audio_data)
        print("You said:", text)
    except sr.UnknownValueError:
        print("Sorry, could not understand audio.")
    except sr.RequestError as e:
        print(
            f"Could not request results from Google Speech Recognition service; {e}")


if __name__ == '__main__':
    socketio.run(app, use_reloader=True, log_output=False,
                 host="0.0.0.0", debug=True)
