# import the necessary packages
import os
import random

import cv2 as cv
import keras.backend as K
import numpy as np

from config import num_classes
from data_generator import random_choice, safe_crop, to_bgr
from model import build_model
from utils import get_best_model

if __name__ == '__main__':
    img_rows, img_cols = 320, 320
    channel = 3

    model = build_model()
    model.load_weights(get_best_model())

    print(model.summary())

    test_images_folder = 'data/instance-level_human_parsing/Testing/Images'
    id_file = 'data/instance-level_human_parsing/Testing/test_id.txt'
    with open(id_file, 'r') as f:
        names = f.read().splitlines()

    samples = random.sample(names, 10)

    for i in range(len(samples)):
        image_name = samples[i]
        filename = os.path.join(test_images_folder, image_name + '.jpg')
        image = cv.imread(filename)
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

        cv.imwrite('images/{}_image.png'.format(i), image)
        cv.imwrite('images/{}_merged.png'.format(i), ret)
        cv.imwrite('images/{}_out.png'.format(i), out)

    K.clear_session()
