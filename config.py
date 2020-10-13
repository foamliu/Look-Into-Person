import scipy.io
import numpy as np

img_rows, img_cols = 320, 320
channel = 3
num_classes = 20

mat = scipy.io.loadmat('./app/process/segnet/human_colormap.mat')
color_map = (mat['colormap'] * 256).astype(np.int32)
