import scipy.io
import numpy as np

img_rows, img_cols = 320, 320
channel = 3
batch_size = 4
epochs = 50
patience = 50
# num_train_samples = 1722
# num_valid_samples = 574
# num_train_samples = 30462
# num_valid_samples = 10000
num_train_samples = 53
num_valid_samples = 26
num_classes = 20
# weight_decay = 1e-3

mat = scipy.io.loadmat('human_colormap.mat')
color_map = (mat['colormap'] * 256).astype(np.int32)
