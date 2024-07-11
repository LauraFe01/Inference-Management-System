from flask import Flask, request, jsonify
from image_utils import decode_image_from_buffer

app = Flask(__name__)

@app.route('/inference', methods=['POST'])
def inference():
    data = request.json
    model_id = data['modelId']
    spectrograms = data['spectrograms']

    for spectrogram in spectrograms:
        buffer = spectrogram["data"]
        torch_tensor = decode_image_from_buffer(buffer)
        print(type(torch_tensor))
    
    result = {'message': 'Inferenza completata', 'modelId': model_id}

    return jsonify(result), 200

@app.route("/")
def hello_world():
    return f"<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(debug=True)
