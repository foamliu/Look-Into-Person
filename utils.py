import multiprocessing
import os

import cv2 as cv
import keras.backend as K
import numpy as np
import tensorflow as tf
from tensorflow.python.client import device_lib

from config import num_classes

# Load the color prior factor that encourages rare classes
prior_factor = np.load("data/prior_factor.npy")
prior_factor = prior_factor.astype(np.float32)


def cross_entropy(y_true, y_pred):
    y_true = K.reshape(y_true, (-1, num_classes))
    y_pred = K.reshape(y_pred, (-1, num_classes))

    idx_max = K.argmax(y_true, axis=1)
    weights = K.gather(prior_factor, idx_max)
    weights = K.reshape(weights, (-1, 1))

    # multiply y_true by weights
    y_true = y_true * weights

    cross_ent = K.categorical_crossentropy(y_pred, y_true)
    cross_ent = K.mean(cross_ent, axis=-1)

    return cross_ent


def focal_loss(gamma=2, alpha=0.75):
    def focal_loss_fixed(y_true, y_pred):  # with tensorflow
        eps = 1e-12
        # improve the stability of the focal loss and see issues 1 for more information
        y_pred = K.clip(y_pred, eps, 1. - eps)
        pt_1 = tf.where(tf.equal(y_true, 1), y_pred, tf.ones_like(y_pred))
        pt_0 = tf.where(tf.equal(y_true, 0), y_pred, tf.zeros_like(y_pred))
        return -K.sum(alpha * K.pow(1. - pt_1, gamma) * K.log(pt_1)) - K.sum(
            (1 - alpha) * K.pow(pt_0, gamma) * K.log(1. - pt_0))

    return focal_loss_fixed


# getting the number of GPUs
def get_available_gpus():
    local_device_protos = device_lib.list_local_devices()
    return [x.name for x in local_device_protos if x.device_type == 'GPU']


# getting the number of CPUs
def get_available_cpus():
    return multiprocessing.cpu_count()


def draw_str(dst, target, s):
    x, y = target
    cv.putText(dst, s, (x + 1, y + 1), cv.FONT_HERSHEY_PLAIN, 1.0, (0, 0, 0), thickness=2, lineType=cv.LINE_AA)
    cv.putText(dst, s, (x, y), cv.FONT_HERSHEY_PLAIN, 1.0, (255, 255, 255), lineType=cv.LINE_AA)


def get_best_model():
    import re
    pattern = 'model.(?P<epoch>\d+)-(?P<val_loss>[0-9]*\.?[0-9]*).hdf5'
    p = re.compile(pattern)
    files = [f for f in os.listdir('models/') if p.match(f)]
    filename = None
    if len(files) > 0:
        accs = [float(p.match(f).groups()[1]) for f in files]
        best_index = int(np.argmax(accs))
        filename = os.path.join('models', files[best_index])
    print('loading best model: {}'.format(filename))
    return filename


def get_highest_acc():
    import re
    pattern = 'model.(?P<epoch>\d+)-(?P<val_acc>[0-9]*\.?[0-9]*).hdf5'
    p = re.compile(pattern)
    acces = [float(p.match(f).groups()[1]) for f in os.listdir('models/') if p.match(f)]
    if len(acces) == 0:
        import sys
        return sys.float_info.min
    else:
        return np.max(acces)
