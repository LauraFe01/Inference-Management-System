import torch
import matplotlib.pyplot as plt


data = torch.load('/Users/lauraferretti/Documents/progettoPA/project/progetto CV&DL uff/P1108/nonapnea/10.pth')
print(data.shape)

plt.imsave('nonapnea10.png', data, cmap='gray')