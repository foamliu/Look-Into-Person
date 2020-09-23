import base64
import re
from PIL import Image
from io import BytesIO

def toBase64(img):
    # most of this came from https://jdhao.github.io/2020/03/17/base64_opencv_pil_image_conversion/
    im_file = BytesIO()
    img.save(im_file, format=img.format)
    im_bytes = im_file.getvalue()  # im_bytes: image in binary format.
    b64 = base64.b64encode(im_bytes)
    b64 = str(b64).split('\'')[1]  #gets rid of the b'...' stuff
    b64 = "".join(b64.split('\\n')) # gets rid of the line breaks
    return b64

def fromBase64(b64_string):
    # Remove metadata prefix from b64 string, decode the string, and open the image data as an image
    b64_string_without_prefix = re.sub('^data:image/.+;base64,', '', b64_string)
    image_data = base64.b64decode(b64_string_without_prefix)
    image = Image.open(BytesIO(image_data))
    return image

def getHTML(b64_string):
    return 'data:image/png;base64,' + b64_string

if __name__ == "__main__":
    img = Image.open('../img/dress.png')
    r = toBase64(img)
    print('<img src="data:image/png;base64, ' + r + '" alt="Red dot" />')
    print(len(r))
