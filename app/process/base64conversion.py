import base64
import re
import cv2.cv2 as cv2
import numpy as np


def to_base64(img):
    # most of this came from https://jdhao.github.io/2020/03/17/base64_opencv_pil_image_conversion/
    img = cv2.imread(img)
    _, im_arr = cv2.imencode('.png', img)
    im_bytes = im_arr.tobytes()
    b64 = base64.b64encode(im_bytes)
    b64 = str(b64).split('\'')[1]  # gets rid of the b'...' stuff
    b64 = "".join(b64.split('\\n'))  # gets rid of the line breaks
    return b64


def from_base64(b64_string):
    # Remove metadata prefix from b64 string, decode the string, and open the image data as an image
    b64_string_without_prefix = re.sub('^data:image/.+;base64,', '', b64_string)
    image_data = base64.b64decode(b64_string_without_prefix)
    image_data = np.frombuffer(image_data, dtype=np.uint8)
    image = cv2.imdecode(image_data, flags=cv2.IMREAD_COLOR)
    return image


def get_html(b64_string):
    return 'data:image/png;base64,' + b64_string
