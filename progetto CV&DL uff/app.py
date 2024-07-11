from flask import Flask, request, jsonify
from image_utils import decode_image_from_buffer
from basic_test import Inference

app = Flask(__name__)

@app.route('/inference', methods=['POST'])
def inference():
    inferenceObj = Inference()

    data = request.json
    model_id = data['modelId']
    spectrograms = data['spectrograms']
    print(spectrograms)

    for spectrogram in spectrograms:
        buffer = spectrogram["data"]
        torch_tensor = decode_image_from_buffer(buffer)

        print(type(torch_tensor))
        predictions = inferenceObj.inference_data(torch_tensor)
        print(predictions)
    
    result = {'message': 'Inferenza completata', 'modelId': model_id,'predictions': predictions}

    return f"{result}"

@app.route("/")
def hello_world():
    return f"<p>Hello, World!</p>"

if __name__ == '__main__':
    app.run(debug=True)
