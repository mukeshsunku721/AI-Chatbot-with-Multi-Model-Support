#  chatbot using groq - llama-3.1-8b-instant model
from flask import Flask, render_template, request, jsonify
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# code for list of models in groq
# models = client.models.list()
# for m in models.data:
#     print(m.id)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = request.json["message"]
    model_name = request.json.get("model", "llama-3.1-8b-instant")

    try:
        response = client.chat.completions.create(
            # model="llama-3.1-8b-instant",
            model = model_name,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        reply = response.choices[0].message.content
        return jsonify({"response": reply})

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)

