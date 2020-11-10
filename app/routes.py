import random
import string

from os.path import split
from flask import send_from_directory, send_file, request, json, after_this_request
from app import app
from app.process.segnet.segment import img_process
from app.tools.dirs import save_upload, save_processed, get_original, get_segmented, save_processed_outlined, \
    save_upload_outlined, create_zip, cleanup
from app.process.outline import *
from app.process.base64conversion import *
from PIL import Image


@app.route('/')
@app.route('/home')
def index():
    return send_file('../dist/web/index.html', 'text/html')


# delete img after processing
@app.route('/segment', methods=['POST'])
def upload_file():
    b64_string = request.form['image']

    serial_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    filename = serial_id + '.png'
    image = from_base64(b64_string)

    file_info = save_upload(image, filename)
    img_data = img_process(file_info[0])
    pro_img = save_processed(img_data, file_info[1])

    processed_base64 = to_base64(pro_img)
    return json.jsonify(segmentedImage=get_html(processed_base64), serialID=serial_id)


@app.route('/outline', methods=['POST'])
def select_segment():
    seg_rgb = request.form['segmentColor']
    outline_color = request.form['outlineColor']
    outline_thickness = request.form['outlineThickness']
    outline_thickness_int = int(outline_thickness)
    serial_id = request.form['serialID']

    seg_image_path = get_segmented(serial_id)
    orig_image_path = get_original(serial_id)
    seg_img = Image.open(seg_image_path)
    img_outline = get_outline(seg_img, seg_rgb)
    orig_image = Image.open(orig_image_path)
    orig_image = paste_outline(orig_image, img_outline, outline_color, outline_thickness_int)
    seg_img = paste_outline(seg_img, img_outline, outline_color, outline_thickness_int)

    orig_f = split(orig_image_path)[1]
    outline_orig_img_path = save_upload_outlined(orig_f, orig_image)

    seg_f = split(seg_image_path)[1]
    outline_seg_img_path = save_processed_outlined(seg_f, seg_img)

    seg_img = get_html(to_base64(outline_seg_img_path))
    orig_image = get_html(to_base64(outline_orig_img_path))

    return json.jsonify(originalOutline=orig_image, segmentedOutline=seg_img)


@app.route('/download', methods=['POST'])
def download():
    serial_id = request.form['serialID']
    orig = request.form['orig']
    orig_outline = request.form['origOutline']
    seg = request.form['seg']
    seg_outline = request.form['segOutline']

    zip_path = create_zip(serial_id, [orig, orig_outline, seg, seg_outline])

    @after_this_request
    def removal(response):
        cleanup(serial_id)
        return response

    return send_file(zip_path, attachment_filename=serial_id + '.zip')


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/web', path)
