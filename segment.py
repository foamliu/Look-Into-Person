import os

import cv2 as cv
import keras.backend as K
import numpy as np

from app.segment.data_generator import random_choice, safe_crop, to_bgr
from app.segment.model import build_model
from app.segment.config import num_classes, img_rows, img_cols

def segment_image(filename):

    model_weights_path = './app/segment/models/model.hdf5'
    model = build_model()
    model.load_weights(model_weights_path)

    filename = 'app/img/uploads/' + filename
    image = cv.imread(filename)
    image = cv.resize(image, (img_rows, img_cols), cv.INTER_CUBIC)
    image_size = image.shape[:2]

    x, y = random_choice(image_size)
    image = safe_crop(image, x, y)

    x_test = np.empty((1, img_rows, img_cols, 3), dtype=np.float32)
    x_test[0, :, :, 0:3] = image / 255.

    out = model.predict(x_test)
    out = np.reshape(out, (img_rows, img_cols, num_classes))
    out = np.argmax(out, axis=2)
    out = to_bgr(out)

    K.clear_session()

    return out
