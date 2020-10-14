import os
from PIL import Image
from app.process.segnet.config import num_classes, img_rows, img_cols
from app.process.segnet.data_generator import random_choice, safe_crop, to_bgr
from app.process.segnet.model import build_model
import numpy as np

def img_process(path):
    model = build_model()
    weights = os.path.join(os.getcwd(), 'app', 'process', 'segnet', 'models', 'model.11-0.8409.hdf5')
    model.load_weights(weights)

    image = np.array(Image.open(path))
    image_size = image.shape[:2]
    x, y = random_choice(image_size)
    image = safe_crop(image, x, y)
    x_test = np.empty((1, img_rows, img_cols, 3), dtype=np.float32)
    x_test[0, :, :, 0:3] = image / 255
    out = model.predict(x_test)
    out = np.reshape(out, (img_rows, img_cols, num_classes))
    out = np.argmax(out, axis=2)
    out = to_bgr(out)

    return out
