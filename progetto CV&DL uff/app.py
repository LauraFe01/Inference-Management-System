import json
from flask import Flask, request, jsonify
from image_utils import decode_image_from_buffer
from basic_test import Inference

app = Flask(__name__)

@app.route('/inference', methods=['POST'])
def inference():
    all_predictions=[]

    data = request.json
    model_id = data['modelId']
    spectrograms = data['spectrograms']
    print(spectrograms)
    inferenceObj = Inference(model_id)

    for spectrogram in spectrograms:
        buffer = spectrogram["data"]
        name = spectrogram["name"]
        torch_tensor = decode_image_from_buffer(buffer)

        print(type(torch_tensor))
        prediction_tensor = inferenceObj.inference_data(torch_tensor)
        prediction = prediction_tensor.item()

        result_item = {
        "name": name,
        "prediction": prediction
        }
        all_predictions.append(result_item)
    
    json_result = json.dumps(all_predictions)

    return json_result

if __name__ == '__main__':
    app.run(debug=True)
