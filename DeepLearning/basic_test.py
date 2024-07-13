import os, sys
import torch
from networks import CRNN_2

class Inference: 
    def __init__(self, modelId):
        super(Inference, self).__init__()
        self.device = torch.device('cpu')
        self.modelId=modelId
        self.net = self.load_model(self.device)

    def load_model(self, device):
        net = CRNN_2()
        if self.modelId == "10_patients_model":
            net.load_state_dict(torch.load("./model/checkpoints/10_patients_model.pth", map_location=device))
        elif self.modelId == "20_patients_model":
            net.load_state_dict(torch.load("./model/checkpoints/20_patients_model.pth", map_location=device))
        net = net.to(device)
        net.eval()

        return net

    def inference_data(self, data):
        data = data.to(self.device)
        with torch.no_grad():
            prediction = self.net(data)

        return prediction