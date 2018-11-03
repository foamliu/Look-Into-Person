# import the necessary packages
import argparse
import os

import cv2 as cv
import keras.backend as K
import numpy as np

from config import num_classes
from data_generator import random_choice, safe_crop, to_bgr
from model import build_model

if __name__ == '__main__':
    # Parse arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-i", "--image", help="path to the image to be processed")
    args = vars(ap.parse_args())
    filename = args["image"]

    img_rows, img_cols = 320, 320
    channel = 3

    model_weights_path = 'models/model.54-2.2507.hdf5'
    model = build_model()
    model.load_weights(model_weights_path)

    print(model.summary())

    image = cv.imread(filename)
    image = cv.resize(image, (img_rows, img_cols), cv.INTER_CUBIC)
    image_size = image.shape[:2]

    x, y = random_choice(image_size)
    image = safe_crop(image, x, y)
    print('Start processing image: {}'.format(filename))

    x_test = np.empty((1, img_rows, img_cols, 3), dtype=np.float32)
    x_test[0, :, :, 0:3] = image / 255.

    out = model.predict(x_test)
    out = np.reshape(out, (img_rows, img_cols, num_classes))
    out = np.argmax(out, axis=2)
    out = to_bgr(out)

    ret = image * 0.6 + out * 0.4
    ret = ret.astype(np.uint8)

    if not os.path.exists('images'):
        os.makedirs('images')

    cv.imwrite('images/test_image.png', image)
    cv.imwrite('images/test_merged.png', ret)
    cv.imwrite('images/test_out.png', out)

    K.clear_session()
