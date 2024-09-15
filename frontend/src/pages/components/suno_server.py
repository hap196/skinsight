from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import requests
import logging

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:3000"}})

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

base_url = 'https://suno-api-rho-two.vercel.app'

@app.route('/')
def home():
    logger.info("Home route accessed")
    return "Suno API Server is running. Use the /api/generate and /api/feed/v2/ endpoints."

@app.route('/api/generate', methods=['POST', 'OPTIONS'])
def generate():
    logger.info(f"Generate route accessed with method: {request.method}")
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        data = request.json
        logger.info(f"Received data: {data}")
        headers = {
            'Authorization': request.headers.get('Authorization'),
            'Content-Type': 'application/json'
        }
        response = requests.post(f"{base_url}/api/generate/v2/", json=data, headers=headers)
        if response.status_code == 200:
            return jsonify(response.json()), 200, {'Access-Control-Allow-Origin': 'http://localhost:3000'}
        else:
            logger.error(f"Error from Suno API: {response.text}")
            return make_response(f"Error from Suno API: {response.text}", response.status_code)
    except Exception as e:
        logger.error(f'Error generating music: {str(e)}')
        return make_response(f"An error occurred while fetching assistant: {str(e)}", 500)

@app.route('/api/feed/v2/', methods=['GET'])
def get_audio():
    logger.info("Get audio route accessed")
    track_id = request.args.get('track_id')
    try:
        headers = {
            'Authorization': request.headers.get('Authorization')
        }
        response = requests.get(f"{base_url}/api/feed/v2/?ids={track_id}", headers=headers)
        if response.status_code == 200:
            return jsonify(response.json()), 200, {'Access-Control-Allow-Origin': 'http://localhost:3000'}
        else:
            logger.error(f"Error from Suno API: {response.text}")
            return make_response(f"Error from Suno API: {response.text}", response.status_code)
    except Exception as e:
        logger.error(f'Error fetching audio: {str(e)}')
        return make_response(f"An error occurred while fetching audio: {str(e)}", 500)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
