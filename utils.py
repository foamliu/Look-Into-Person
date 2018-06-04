import multiprocessing

import cv2 as cv
import numpy as np
import tensorflow as tf
from tensorflow.python.client import device_lib

class_weights = np.load('median_class_weights.npy')


def cross_entropy(y_true, y_pred):
    labels = y_true
    weighted_logits = tf.mul(y_pred, class_weights)
    loss = tf.nn.softmax_cross_entropy_with_logits(labels=labels,
                                                   logits=weighted_logits)
    loss_mean = tf.reduce_mean(loss)
    return loss_mean


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
