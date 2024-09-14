from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import io
import pickle
import openai
from openai import OpenAI
import os

app = Flask(__name__)
CORS(app)

# initialize gpt chat instance
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

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
def get_skincare_recs(predicted_disease):
    prompt = f"I have been diagnosed with {predicted_disease}. You provide ingredient recommendations for skincare. Given information about a person's skin conditions (e.g. acne, eczema, psoriasis, rosacea), skin type (dry, combination, or oily), skin concerns the person wants to address (large pores, wrinkles, sun spots, bumpy skin, sebaceous filaments, hyperpigmentation, blackheads, acne scars, flaky skin), and if the person has sensitive skin, provide a bulleted list of skincare ingredients that would help the person address their needs. Keep the list under 8 ingredients. Make sure all the ingredients can be used together (they do not react with each other or they are not too strong together). Do not recommend brands. Underneath the bulleted list, provide a 2-3 sentence description about each ingredient. Keep the terminology simple enough for a middle schooler to understand. Below the ingredient descriptions, suggest a short skincare routine (morning and night) using the ingredients you recommended. Separate the bulleted list of ingredients, the descriptions, and the skincare routine with '====='."

    try:
        # call gpt
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
        return recommendations

    except Exception as e:
        print(f"Error in get_skincare_recs: {str(e)}")
        return f"Unable to generate recommendations due to: {str(e)}"


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        # allow GET requests from any origin with the content-type (prevents CORS errors)
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # user must upload a file first
    if "file" not in request.files:
        return (
            jsonify({"error": "No file uploaded. You must upload a file first."}),
            400,
        )

    try:
        # open the file internally
        file = request.files["file"]
        img = Image.open(io.BytesIO(file.read()))
        processed_img = preprocess_image(img, target_size=(224, 224))

        # get a prediction from the model
        predictions = model.predict(processed_img)
        predicted_disease = label_encoder.inverse_transform([np.argmax(predictions)])

        skincare_recs = get_skincare_recs(predicted_disease[0])

        # send the json package to frontend
        return jsonify(
            {
                "predicted_disease_class": predicted_disease[0],
                "skincare_recommendations": skincare_recs,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# start app
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
