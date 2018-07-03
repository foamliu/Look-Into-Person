import scipy.io
import numpy as np

img_rows, img_cols = 320, 320
channel = 3
batch_size = 16
epochs = 1000
patience = 50
num_train_samples = 28280
num_valid_samples = 5000
num_classes = 20
weight_decay = 1e-2

mat = scipy.io.loadmat('human_colormap.mat')
color_map = (mat['colormap'] * 256).astype(np.int32)
