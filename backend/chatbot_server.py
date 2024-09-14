import os
import time
import re
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from openai import OpenAI
import json
import logging
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)
assistant_id = None
thread_id = None

def remove_source(text):
    text = str(text)
    text = re.sub(r'\【.*?\】', '', text)
    text = re.sub(r'\*+', '', text)
    return text.strip()

@app.route('/get_assistant', methods=['POST'])
def get_assistant():
    global assistant_id

    data = json.loads(request.data)
    user_input = data.get('input')

    try:
        assistant_id = 'asst_A3YGhsDgqZdYk85UyXsRiX6s'
        return jsonify({'assistant_id': assistant_id})
    except Exception as e:
        logger.error('Error fetching assistant: %s', str(e))
        return make_response(f"An error occurred while fetching assistant: {str(e)}", 500)

@app.route('/send_message', methods=['POST'])
def send_message():
    global assistant_id, thread_id

    data = json.loads(request.data)
    user_input = data.get('input')
    thread_id = data.get('threadId')

    try:
        if not thread_id:
            thread = client.beta.threads.create()
            thread_id = thread.id

        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_input,
        )

        run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant_id)

        while True:
            response = client.beta.threads.runs.retrieve(run_id=run.id, thread_id=thread_id)
            if response.status not in ["in_progress", "queued"]:
                break
            time.sleep(2)

        message_list = client.beta.threads.messages.list(thread_id)
        last_message = next((msg for msg in message_list.data if msg.run_id == run.id and msg.role == 'assistant'), None)
        answer = remove_source(last_message.content[0].text.value)

        if answer:
            return jsonify({'response': answer, 'threadId': thread_id})
        else:
            return make_response('No response from the assistant.', 500)

    except Exception as e:
        logger.error('Error retrieving response: %s', str(e))
        return make_response(f"An error occurred while retrieving response: {str(e)}", 500)

if __name__ == '__main__':
    app.run(debug=True)
