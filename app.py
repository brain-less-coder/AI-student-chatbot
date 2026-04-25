from flask import Flask, render_template, request, jsonify
import random
import json
import pickle
import numpy as np
import nltk

from nltk.stem import WordNetLemmatizer
from keras.models import load_model

# Download NLTK data
# Download NLTK data
nltk.download('punkt')
nltk.download('punkt_tab')   # ADD THIS
nltk.download('wordnet')
nltk.download('omw-1.4')
app = Flask(__name__)

lemmatizer = WordNetLemmatizer()

intents = json.loads(open('intents.json').read())

words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = load_model('chatbot_model.h5', compile=False)


def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)

    sentence_words = [
        lemmatizer.lemmatize(word.lower())
        for word in sentence_words
    ]

    return sentence_words


def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)

    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1

    return np.array(bag)


def predict_class(sentence):
    bow = bag_of_words(sentence)

    res = model.predict(np.array([bow]), verbose=0)[0]

    ERROR_THRESHOLD = 0.40

    results = [
        [i, r]
        for i, r in enumerate(res)
        if r > ERROR_THRESHOLD
    ]

    results.sort(key=lambda x: x[1], reverse=True)

    return_list = []

    for r in results:
        return_list.append({
            'intent': classes[r[0]],
            'probability': str(r[1])
        })

    return return_list


def get_response(intents_list, intents_json):
    if len(intents_list) == 0:
        return "Sorry, I didn't understand that."

    tag = intents_list[0]['intent']

    for i in intents_json['intents']:
        if i['tag'] == tag:
            return random.choice(i['responses'])

    return "I don't know how to respond."


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get", methods=["POST"])
def chatbot_response():
    user_message = request.form["msg"]

    ints = predict_class(user_message)
    response = get_response(ints, intents)

    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)