from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

# Folder to store uploaded images temporarily
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🔥 Load trained model
model = load_model("crop_disease_model.h5")

# ✅ EXACT class order from training output
class_names = [
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___healthy",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
    "bacterial_leaf_blight",
    "blast",
    "brown_spot",
    "normal"
]

# ✅ Remedies mapped EXACTLY to class names
remedies = {
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot":
        "Apply fungicide and remove infected leaves.",

    "Corn_(maize)___Common_rust_":
        "Apply sulfur-based fungicide spray.",

    "Corn_(maize)___healthy":
        "No treatment required. Crop is healthy.",

    "Potato___healthy":
        "No treatment required. Crop is healthy.",

    "Tomato___Bacterial_spot":
        "Apply copper-based bactericide spray.",

    "Tomato___Tomato_mosaic_virus":
        "Remove infected plants and control insect vectors.",

    "Tomato___healthy":
        "No treatment required. Crop is healthy.",

    "bacterial_leaf_blight":
        "Apply copper-based bactericide immediately.",

    "blast":
        "Spray tricyclazole fungicide.",

    "brown_spot":
        "Improve soil fertility and apply fungicide.",

    "normal":
        "No treatment required. Crop is healthy."
}


@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files["image"]

    if image_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(image_file.filename)
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(save_path)

    try:
        # 🔥 Preprocess Image
        img = image.load_img(save_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # 🔥 Predict
        prediction = model.predict(img_array)
        class_index = np.argmax(prediction)
        confidence = float(np.max(prediction))

        disease = class_names[class_index]

        # Debug print
        print("Prediction Array:", prediction)
        print("Predicted Class:", disease)
        print("Confidence:", confidence)

        remedy = remedies.get(disease, "Consult agricultural expert.")

        return jsonify({
            "disease": disease,
            "confidence": confidence,
            "remedy": remedy
        })

    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({"error": "Prediction failed"}), 500

    finally:
        # Remove temp file
        if os.path.exists(save_path):
            os.remove(save_path)


@app.route("/", methods=["GET"])
def home():
    return "AI Server Running Successfully"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)