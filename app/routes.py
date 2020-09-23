from flask import send_from_directory, send_file, request, json, url_for
from app import app
from app.process.seg import img_process
from app.tools.dirs import save_upload, save_processed
from app.process.outline import *
from PIL import Image
import os
from app.process.base64conversion import *


def json_response(payload, status=200):
    return json.dumps(payload), status, {'content-type': 'application/json'}


@app.route('/')
@app.route('/home')
def index():
    return send_file('../dist/web/index.html', 'text/html')


# delete img after processing
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():

    b64_string = request.form['image']
    filename = request.form['fileName']

    image = fromBase64(b64_string)
    image.filename = filename

    fileinfo = save_upload(image)
    img_data = img_process(fileinfo[0])
    pro_img = save_processed(img_data, fileinfo[1])

    processed_base64 = toBase64(Image.open(pro_img))
    return json_response({'segmentedImage': getHTML(processed_base64)})

@app.route('/select_segment', methods=['GET', 'POST'])
def select_segment():
    if request.method == 'GET':
        img_seg = Image.open('app/img/dress0_seg.png')
        img = Image.open('app/img/dress0.png')
        outline = getOutline(img_seg,(85, 0, 0))
        imgSegOutlined = pasteOutline(img_seg,outline)
        b64_seg = toBase64(imgSegOutlined)

        imgOutlined = pasteOutline(img, outline)
        b64 = toBase64(imgOutlined)
        html = getHTML(b64) + getHTML(b64_seg)
        return html

    else:
        #sessionId = request.data['sessionID']
        segRGB = request.data['segRGB']  # RGB is the color of the segment.  Use a 3-element tupple. e.g. (0, 255, 255)
        seg_image = request.data['seg_image_name']  #this should correspond with the file name on the server
        orig_image = request.data['orig_image_name']
        # fs_path = ?????
        #img = Image(fs_path)  #the argument for this constructor expects a file system path
        #img_outline = getOutline(img, (85, 0, 0))
        #pasteOutline(originalFile, img_outline)
        #pasteOutline(img, img_outline)

        # at this point seg_image and orig_image are both outlined - they can be returned (let me know if you need them as thumbnails

@app.route('/download_image', methods=['POST'])
def download_image():
    # sessionId = request.data['sessionID']
    files = request.data['files']  #I'm expecting a list here

    #for f in files:
        #base64-ify image (not sure how to pass multiple)

@app.route('/demo', methods=['GET', 'POST'])
def demo():
    html = ""
    for i in range(0,5,1):
        img = Image.open('app/img/dress' + str(i) + '.png')
        b64 = toBase64(img)
        link = '<a href=' + url_for('demo_result') + '?img=' + str(i) + '>' + getHTML(b64) + '<a/>'
        html = html + link
    return html

@app.route('/demo_result', methods=['GET', 'POST'])
def demo_result():
    if request.method == 'GET':
        img_number = request.args['img']
        img_seg = Image.open('app/img/dress' + str(img_number) + '_seg.png')
        img = Image.open('app/img/dress' + str(img_number) + '.png')
        outline = getOutline(img_seg,(85, 0, 0))
        imgSegOutlined = pasteOutline(img_seg,outline)
        b64_seg = toBase64(imgSegOutlined)

        imgOutlined = pasteOutline(img, outline)
        b64 = toBase64(imgOutlined)
        html = getHTML(b64) + getHTML(b64_seg)
        return html

@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/web', path)
