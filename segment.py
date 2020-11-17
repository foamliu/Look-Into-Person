import os
import cv2 as cv2
from app.process.segnet.config import num_classes, img_rows, img_cols
from app.process.segnet.data_generator import to_bgr
from app.process.segnet.model import build_model
import numpy as np


def add_pixels(img):
    h = img.shape[0]
    w = img.shape[1]

    if h == 320 and w == 320:
        return img

    if 320 - h >= 0:
        border_size = 320 - h
        border = cv2.copyMakeBorder(
            img,
            top=0,
            bottom=border_size,
            left=0,
            right=0,
            borderType=cv2.BORDER_CONSTANT,
            value=[255, 255, 255]
        )

    if 320 - w >= 0:
        border_size = 320 - w
        border = cv2.copyMakeBorder(
            img,
            top=0,
            bottom=0,
            left=0,
            right=border_size,
            borderType=cv2.BORDER_CONSTANT,
            value=[255, 255, 255]
        )

    return border


def custom_resize(img):
    h = img.shape[0]
    w = img.shape[1]

    if h <= 320 and w <= 320:
        return img

    if h < w:
        s = 320 / float(w)
    elif w < h:
        s = 320 / float(h)
    else:
        s = 320 / float(w)

    dim = (int(w * s), int(h * s))
    resize = cv2.resize(img, dim, interpolation=cv2.INTER_AREA)
    return resize


def img_process(path):
    model = build_model()
    weights = os.path.join(os.getcwd(), 'app', 'process', 'segnet', 'models', 'model.11-0.8409.hdf5')
    model.load_weights(weights)

    image = cv2.imread(path)
    image = custom_resize(image)
    image = add_pixels(image)
    cv2.imwrite(path, image)
    x_test = np.empty((1, img_rows, img_cols, 3), dtype=np.float32)
    x_test[0, :, :, 0:3] = image / 255
    out = model.predict(x_test)
    out = np.reshape(out, (img_rows, img_cols, num_classes))
    out = np.argmax(out, axis=2)
    out = to_bgr(out)

    return out
