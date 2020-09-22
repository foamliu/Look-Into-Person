import base64
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

def getHTML(b64_string):
    return '<img src="data:image/png;base64, ' + b64_string + '" alt="Red dot" />'

if __name__ == "__main__":
    img = Image.open('../img/dress.png')
    r = toBase64(img)
    print('<img src="data:image/png;base64, ' + r + '" alt="Red dot" />')
    print(len(r))
