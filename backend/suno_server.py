from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins for API endpoints

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

base_url = 'https://suno-api-slft-f131g9sej-josiexws-projects.vercel.app'

@app.route('{base_url}/api/generate/v2/', methods=['POST'])
def generate():
    try:
        data = request.json
        response = requests.post(f"{base_url}/api/generate/v2/", json=data)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return make_response(f"Error from Suno API: {response.text}", response.status_code)
    except Exception as e:
        logger.error('Error generating music: %s', str(e))
        return make_response(f"An error occurred while fetching assistant: {str(e)}", 500)

@app.route('{base_url}/api/generate/v2/<string:track_id>', methods=['GET'])
def get_audio(track_id):
    try:
        response = requests.get(f"{base_url}/api/generate/v2/{track_id}")
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return make_response(f"Error from Suno API: {response.text}", response.status_code)
    except Exception as e:
        logger.error('Error fetching audio: %s', str(e))
        return make_response(f"An error occurred while fetching audio: {str(e)}", 500)

if __name__ == '__main__':
    app.run(debug=True)
