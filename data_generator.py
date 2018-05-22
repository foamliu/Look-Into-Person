import numpy as np
import os
import cv2 as cv
import random
from config import batch_size, img_rows, img_cols

train_images_folder = 'data/instance-level_human_parsing/Training/Images'
train_categories_folder = 'data/instance-level_human_parsing/Training/Categories'


def get_semantic(name):
    tokens = name.split('_')
    tokens[-1] = 'semantic_pretty.png'
    name = '_'.join(tokens)
    filename = os.path.join(semantic_folder, name)
    semantic = cv.imread(filename)
    return semantic


def get_y(semantic):
    temp = np.zeros(shape=(320, 320, num_classes), dtype=np.int32)
    semantic = np.array(semantic).astype(np.int32)
    for i in range(num_classes):
        temp[:, :, i] = np.sum(np.abs(semantic - colors[i]), axis=2)
    y = np.argmin(temp, axis=2)
    return y


def to_bgr(y_pred):
    ret = np.zeros((img_rows, img_cols, 3), np.float32)
    for r in range(320):
        for c in range(320):
            color_id = y_pred[r, c]
            # print("color_id: " + str(color_id))
            ret[r, c, :] = colors[color_id]
    ret = ret.astype(np.uint8)
    return ret


def random_choice(image_size, crop_size):
    height, width = image_size
    crop_height, crop_width = crop_size
    x = random.randint(0, width - crop_width)
    y = random.randint(0, height - crop_height)
    return x, y


def safe_crop(mat, x, y, crop_size):
    crop_height, crop_width = crop_size
    if len(mat.shape) == 2:
        ret = np.zeros((crop_height, crop_width), np.float32)
    else:
        ret = np.zeros((crop_height, crop_width, 3), np.float32)
    crop = mat[y:y + crop_height, x:x + crop_width]
    h, w = crop.shape[:2]
    ret[0:h, 0:w] = crop
    if crop_size != (320, 320):
        ret = cv.resize(ret, dsize=(img_rows, img_cols), interpolation=cv.INTER_CUBIC)
    return ret

def data_gen(usage):
    filename = '{}_names.txt'.format(usage)
    with open(filename, 'r') as f:
        names = f.read().splitlines()
    i = 0
    np.random.shuffle(names)
    while True:
        batch_x = np.empty((batch_size, img_rows, img_cols, 3), dtype=np.float32)
        batch_y = np.empty((batch_size, img_rows, img_cols), dtype=np.int32)

        for i_batch in range(batch_size):
            name = names[i]
            filename = os.path.join(train_folder, name)
            image = cv.imread(filename)
            image_size = image.shape[:2]
            semantic = get_semantic(name)

            different_sizes = [(320, 320), (480, 480), (640, 640)]
            crop_size = random.choice(different_sizes)

            x, y = random_choice(image_size, crop_size)
            image = safe_crop(image, x, y, crop_size)
            semantic = safe_crop(semantic, x, y, crop_size)

            if np.random.random_sample() > 0.5:
                image = np.fliplr(image)
                semantic = np.fliplr(semantic)

            x = image / 255.
            y = get_y(semantic)

            batch_x[i_batch, :, :, 0:3] = x
            batch_y[i_batch, :, :] = y

            i += 1
            if i >= len(names):
                i = 0
                np.random.shuffle(names)

        yield batch_x, batch_y


def train_gen():
    return data_gen('train')


def valid_gen():
    return data_gen('valid')