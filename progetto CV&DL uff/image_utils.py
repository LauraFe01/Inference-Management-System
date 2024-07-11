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

    # Converte l'array numpy in un tensore PyTorch
    image_tensor = torch.tensor(image_array)

    return image_tensor
