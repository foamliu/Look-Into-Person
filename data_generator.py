import random
import numpy as np
from app.process.segnet.config import img_rows, img_cols, color_map


def to_bgr(y_pred):
    ret = np.zeros((img_rows, img_cols, 3), np.float32)
    for r in range(320):
        for c in range(320):
            color_id = y_pred[r, c]
            ret[r, c, :] = color_map[color_id]
    ret = ret.astype(np.uint8)
    return ret


def random_choice(image_size):
    height, width = image_size
    crop_height, crop_width = 320, 320
    x = random.randint(0, max(0, width - crop_width))
    y = random.randint(0, max(0, height - crop_height))
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

