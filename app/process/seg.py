from skimage.color import rgb2gray, rgba2rgb
from skimage import io
import os


def img_process(path):
    img = io.imread(path)
    grayed = rgb2gray(img)
    os.remove(path)
    return grayed
