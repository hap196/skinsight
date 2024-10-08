from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import io
import pickle
import openai
import requests
from openai import OpenAI
import os
from authlib.integrations.flask_client import OAuth
import db
from dotenv import load_dotenv

load_dotenv()

######## CREATE APP + DATABASE ########
app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)
app.config["SESSION_TYPE"] = "filesystem"
# secret key for session management
app.secret_key = "secret_key"
oauth = OAuth(app)

####### TEST ######
# #test to insert data to the data base
# db.db.user_collection.insert_one({"name": "John"})

####### USER LOGIN ########
######## MODEL STUFF ########
# initialize gpt chat instance
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

####### SUNO STUFF #########
API_TOKEN = "ev1bT0aXN60JvSjzbdJdHrSq2snAMDh7"
BASE_URL_GENERATE = "https://studio-api.suno.ai/api/generate/v2/"
BASE_URL_FEED = "https://studio-api.suno.ai/api/feed/v2/?id="

# setup oauth
oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    access_token_url="https://oauth2.googleapis.com/token",
    authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
    client_kwargs={
        "scope": "openid email profile",
        "token_endpoint_auth_method": "client_secret_post",
    },
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
)


# login route
@app.route("/login")
def login():
    redirect_uri = url_for("auth_callback", _external=True)
    return google.authorize_redirect(redirect_uri)


@app.route("/auth/callback")
def auth_callback():
    token = google.authorize_access_token()
    user_info = google.get("https://www.googleapis.com/oauth2/v3/userinfo").json()

    # store or update user info in MongoDB
    user_data = {
        "email": user_info["email"],
        "name": user_info["name"],
        "profile_pic": user_info.get("picture", ""),
    }
    db.user_collection.update_one(
        {"email": user_info["email"]}, {"$set": user_data}, upsert=True
    )

    # store the user in session
    session["user"] = user_info
    print("Session after login:", session["user"])
    return redirect("http://localhost:3000/quiz")

# Endpoint to check the status of the audio file
@app.route('/check_audio/<song_id>', methods=['GET'])
def check_audio(song_id):
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    # Poll Suno API to check if the audio is ready
    feed_response = requests.get(f"{BASE_URL_FEED}{song_id}", headers=headers)

    if feed_response.status_code == 200:
        clips = feed_response.json().get("clips", [])
        if clips and clips[0].get("audio_url"):
            audio_url = clips[0].get("audio_url", "")
            print(f"Audio URL: {audio_url}")  # Print the audio URL in the console
            return jsonify({"audio_url": audio_url}), 200
        else:
            return jsonify({"audio_url": None}), 200
    else:
        return jsonify({"error": "Error checking audio"}), 500

@app.route("/saveQuizData", methods=["POST"])
def save_quiz_data():
    user = session.get("user")
    if not user:
        return jsonify({"error": "User not logged in"}), 401

    try:
        data = request.get_json()
        prediction = data.get('prediction')
        gptResponse = data.get('gptResponse')

        # Update user's document with the quiz data
        db.user_collection.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "quiz_data": {
                        "prediction": prediction,
                        "gpt_response": gptResponse
                    }
                }
            }
        )

        return jsonify({"message": "Quiz data saved successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error saving quiz data: {str(e)}")
        return jsonify({"error": "Failed to save quiz data"}), 500


@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/")

@app.route("/profile", methods=["GET", "POST"])
def profile():
    user = session.get("user")
    if user:
        quiz_data = db.user_collection.find_one({"email": user["email"]}, {"quiz_data": 1})
        user["quiz_data"] = quiz_data.get("quiz_data", {}) if quiz_data else {}
        response = jsonify(user)
    else:
        response = jsonify({"error": "User not logged in"}), 401

    # # Add necessary CORS headers to allow credentials
    # response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    # response.headers.add("Access-Control-Allow-Credentials", "true")
    
    return response



# load model and encoder
model = load_model("skin_classifier.h5")
with open("label_encoder.pkl", "rb") as file:
    label_encoder = pickle.load(file)


# process files to be in same format for model
def preprocess_image(img, target_size):
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize(target_size)
    img = np.array(img)
    img = np.expand_dims(img, axis=0)
    img = tf.keras.applications.resnet50.preprocess_input(img)
    return img


# function to prompt and get a response from gpt (later to be replaced with a live chatbot)
def get_skincare_recs(predicted_disease, conditions_dict):
    prompt = f'I have been diagnosed with {predicted_disease}. You provide ingredient recommendations for skincare. You are given information about a person\'s skin conditions (e.g. acne, eczema, psoriasis, rosacea), skin type (dry, combination, or oily), skin concerns the person wants to address (large pores, wrinkles, sun spots, bumpy skin, sebaceous filaments, hyperpigmentation, blackheads, acne scars, flaky skin), if the person has sensitive skin, and other lifestyle details. Here is that data: {conditions_dict}. Based on this information, only return the information in the JSON format seen at the end. Provide a bulleted list of skincare ingredients that would help the person address their needs; add it to the "ingredients" key. Keep the list under 8 ingredients. Make sure all the ingredients can be used together (they do not react with each other or they are not too strong together). Do not recommend brands. Next, provide a 2-3 sentence description about each ingredient; add it to the "ingredient_descriptions" key. Keep the terminology simple enough for a middle schooler to understand. Next, suggest a short skincare routine (morning and night) using the ingredients you recommended. Each step should be a single full sentence with line breaks, and DO NOT number them. Also, DO NOT add line breaks after them. Add the morning routine to the "morning" key and the night routine to the "night" key. JSON object: {{"ingredients": dictionary of (key, value) pairs being (name, description and how it addresses the conditions), "morning": first step. then next step. then third step. "", "night": "", }} DO NOT INCLUDE ANY EXTRA QUOTATIONS OR ANYTHING FOR THE JSON OBJECT SO THAT IT IS CONVERTABLE WITH JSON.PARSE. Again, DO NOT NUMBER THE STEPS IN THE ROUTINES.'

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a skincare expert."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=500,
            temperature=0.7,
        )

        recommendations = response.choices[0].message.content.strip()
        return recommendations  # Return the string content, not a Response object

    except Exception as e:
        print(f"Error in get_skincare_recs: {str(e)}")
        return f"Unable to generate recommendations due to: {str(e)}"
    
# Endpoint to generate a song
@app.route('/generate', methods=['POST'])
def generate_song():
    data = request.get_json()
    gpt_description_prompt = data.get('gpt_description_prompt')
    music_style = data.get('music_style')

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": "",
        "gpt_description_prompt": gpt_description_prompt,
        "tags": music_style,
        "mv": "chirp-v3-5"
    }

    # Send request to Suno API to generate the song
    response = requests.post(BASE_URL_GENERATE, json=payload, headers=headers)

    if response.status_code == 200:
        song_id = response.json()["id"]
        return jsonify({"song_id": song_id}), 200
    else:
        return jsonify({"error": "Error generating song"}), 500


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    try:
        if "file" not in request.files:
            return (
                jsonify({"error": "No file uploaded. You must upload a file first."}),
                400,
            )

        file = request.files["file"]
        img = Image.open(io.BytesIO(file.read()))
        processed_img = preprocess_image(img, target_size=(224, 224))

        predictions = model.predict(processed_img)
        predicted_disease = label_encoder.inverse_transform([np.argmax(predictions)])

        quiz_data = {
            key: request.form.get(key) for key in request.form if key != "file"
        }
        skincare_recs = get_skincare_recs(predicted_disease[0], quiz_data)

        return jsonify(
            {
                "predicted_disease_class": predicted_disease[0],
                "skincare_recommendations": skincare_recs,
            }
        )
    except Exception as e:
        app.logger.error(f"Error in predict route: {str(e)}")
        return jsonify({"error": str(e)}), 500


# start app
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
