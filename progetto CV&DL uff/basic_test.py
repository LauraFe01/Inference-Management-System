import os, sys
import torch
from networks import CRNN_2

class Inference: 
    def __init__(self):
        super(Inference, self).__init__()
        self.device = torch.device('cpu')
        self.net = self.load_model(self.device)

    def load_model(self, device):
        net = CRNN_2()
        net.load_state_dict(torch.load("./model/checkpoints/20_patients_model.pth", map_location=device))
        net = net.to(device)
        net.eval()

        return net

    def inference_data(self, data):
        pred_labels = []
        data = data.to(self.device)
        with torch.no_grad():
            prediction1 = self.net(data)

        pred_labels.append(prediction1)

        return pred_labels