import wave
from PIL import Image
import io
import numpy as np
import torch

def decode_image_from_buffer(buffer):
    byte_array = buffer['data']
    
    # Converte l'array di byte in un oggetto BytesIO
    bytes_io = io.BytesIO(bytearray(byte_array))

    # Apre l'immagine usando PIL (Pillow)
    image = Image.open(bytes_io)

    # Converte l'immagine in un array numpy
    image_array = np.array(image)

    # Verifica le dimensioni dell'immagine
    if image_array.shape == (64, 519, 4):
        # Rimuove la terza dimensione (ad esempio, se è un'immagine RGBA con 4 canali)
        image_array = image_array[:, :, 0]  # Prendi solo il primo canale

    # Converte l'array numpy in un tensore PyTorch
    image_tensor = torch.tensor(image_array, dtype=torch.float32)
    tensor_image = image_tensor.unsqueeze(0).unsqueeze(0)

    return tensor_image