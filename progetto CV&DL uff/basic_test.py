import os, sys
import torch
from networks import CRNN_2

checkpoint_path = "./model/checkpoints"
device = torch.device('cpu')
net = CRNN_2()
net.load_state_dict(torch.load("./model/checkpoints/20_patients_model.pth", map_location=device))
net = net.to(device)
net.eval()
pred_labels = []


for data in dataset:
    data = data.to(device)
    with torch.no_grad():
        prediction1 = net(data)

    pred_labels.append(prediction1)