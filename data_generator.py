import numpy as np
import os
import cv2 as cv
import random
from config import batch_size, img_rows, img_cols, num_classes, color_map

train_images_folder = 'data/instance-level_human_parsing/Training/Images'
train_categories_folder = 'data/instance-level_human_parsing/Training/Categories'
valid_images_folder = 'data/instance-level_human_parsing/Validation/Images'
valid_categories_folder = 'data/instance-level_human_parsing/Validation/Categories'


def get_category(categories_folder, name):
    filename = os.path.join(categories_folder, name + '.png')
    semantic = cv.imread(filename)
    return semantic


def get_y(category):
    temp = np.zeros(shape=(320, 320, num_classes), dtype=np.int32)
    category = np.array(category).astype(np.int32)
    for i in range(num_classes):
        temp[:, :, i] = np.sum(np.abs(category - color_map[i]), axis=2)
    y = np.argmin(temp, axis=2)
    return y


def to_bgr(y_pred):
    ret = np.zeros((img_rows, img_cols, 3), np.float32)
    for r in range(320):
        for c in range(320):
            color_id = y_pred[r, c]
            # print("color_id: " + str(color_id))
            ret[r, c, :] = color_map[color_id]
    ret = ret.astype(np.uint8)
    return ret


def random_choice(image_size):
    height, width = image_size
    crop_height, crop_width = 320, 320
    x = random.randint(0, width - crop_width)
    y = random.randint(0, height - crop_height)
    return x, y


def safe_crop(mat, x, y):
    crop_height, crop_width = 320, 320
    if len(mat.shape) == 2:
        ret = np.zeros((crop_height, crop_width), np.float32)
    else:
        ret = np.zeros((crop_height, crop_width, 3), np.float32)
    crop = mat[y:y + crop_height, x:x + crop_width]
    h, w = crop.shape[:2]
    ret[0:h, 0:w] = crop
    return ret


def data_gen(usage):
    if usage == 'train':
        id_file = 'data/instance-level_human_parsing/Training/train_id.txt'
        images_folder = train_images_folder
        categories_folder = train_categories_folder
    else:
        id_file = 'data/instance-level_human_parsing/Validation/val_id.txt'
        images_folder = valid_images_folder
        categories_folder = valid_categories_folder

    with open(id_file, 'r') as f:
        names = f.read().splitlines()
    i = 0
    np.random.shuffle(names)
    while True:
        batch_x = np.empty((batch_size, img_rows, img_cols, 3), dtype=np.float32)
        batch_y = np.empty((batch_size, img_rows, img_cols), dtype=np.int32)

        for i_batch in range(batch_size):
            name = names[i]
            filename = os.path.join(images_folder, name + '.jpg')
            image = cv.imread(filename)
            image_size = image.shape[:2]
            category = get_category(categories_folder, name)

            # different_sizes = [(320, 320), (480, 480), (640, 640)]
            # crop_size = random.choice(different_sizes)

            x, y = random_choice(image_size)
            image = safe_crop(image, x, y)
            category = safe_crop(category, x, y)

            if np.random.random_sample() > 0.5:
                image = np.fliplr(image)
                category = np.fliplr(category)

            x = image / 255.
            y = get_y(category)

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
