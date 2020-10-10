import random
import string

from flask import send_from_directory, send_file, request, json, url_for
from app import app
from app.process.seg import img_process
from app.tools.dirs import save_upload, save_processed, get_original, get_segmented
from app.process.outline import *
from PIL import Image
import os
from app.process.base64conversion import *


@app.route('/')
@app.route('/home')
def index():
    return send_file('../dist/web/index.html', 'text/html')


# delete img after processing
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    b64_string = request.form['image']
    filename = request.form['fileName']

    serial_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    extension = filename.rsplit('.', 1)[1].lower()
    image = fromBase64(b64_string)
    image.filename = serial_id + '.' + extension

    fileinfo = save_upload(image)
    img_data = img_process(fileinfo[0])
    pro_img = save_processed(img_data, fileinfo[1])

    processed_base64 = toBase64(Image.open(pro_img))
    return json.jsonify(segmentedImage=getHTML(processed_base64), serialID=serial_id)


@app.route('/outline', methods=['GET', 'POST'])
def select_segment():
    seg_rgb = request.form['segmentColor']
    seg_rgb_tuple = tuple(map(int, seg_rgb.split(',')))
    outline_color = request.form['outlineColor']
    outline_rgb_tuple = tuple(map(int, outline_color.split(',')))
    outline_thickness = request.form['outlineThickness']
    outline_thickness_int = int(outline_thickness)
    serial_id = request.form['serialID']

    seg_image_path = get_segmented(serial_id)
    orig_image_path = get_original(serial_id)
    seg_img = Image.open(seg_image_path)
    img_outline = get_outline2(seg_img, seg_rgb_tuple)
    orig_image = Image.open(orig_image_path)
    orig_image = paste_outline2(orig_image, img_outline, outline_rgb_tuple, outline_thickness_int)
    seg_img = paste_outline2(seg_img, img_outline, outline_rgb_tuple, outline_thickness_int)

    orig_image.save(orig_image_path)
    seg_img.save(seg_image_path)

    seg_img = getHTML(toBase64(Image.open(seg_image_path)))
    orig_image = getHTML(toBase64(Image.open(orig_image_path)))

    return json.jsonify(originalOutline=orig_image, segmentedOutline=seg_img)


@app.route('/download_image', methods=['POST'])
def download_image():
    # sessionId = request.data['sessionID']
    files = request.data['files']  # I'm expecting a list here

    # for f in files:
    # base64-ify image (not sure how to pass multiple)


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/web', path)
