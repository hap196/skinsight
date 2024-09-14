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

# https://suno-ai.notion.site/External-Suno-HackMIT-API-Docs-a47928f8b7ca4b7ab8e0af8a1323ebf1
# https://vercel.com/josiexws-projects/suno-api-slft
# https://github.com/gcui-art/suno-api

app = Flask(__name__)
CORS(app)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

base_url = 'https://suno-api-slft-f131g9sej-josiexws-projects.vercel.app'

@app.route('/generate', methods=['POST'])
def generate():
    try:
        pass
    except Exception as e:
        logger.error('Error generating music: %s', str(e))
        return make_response(f"An error occurred while fetching assistant: {str(e)}", 500)

if __name__ == '__main__':
    app.run(debug=True)
