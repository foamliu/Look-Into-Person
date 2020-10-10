from os.path import join, dirname, realpath, isdir, split, basename
from app import app
from werkzeug.utils import secure_filename
from os import makedirs, listdir
from PIL import Image

basepath = split(dirname(realpath(__file__)))
UPLOAD_FOLDER = join(basepath[0], 'img/uploads')
PROCESSED_FOLDER = join(basepath[0], 'img/processed')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(f):
    if f and allowed_file(f.filename):
        filename = secure_filename(f.filename)
        curr_img_path = join(UPLOAD_FOLDER, filename)
        if isdir(UPLOAD_FOLDER):
            f.save(curr_img_path)
        else:
            makedirs(UPLOAD_FOLDER)
            f.save(curr_img_path)
        return [curr_img_path, filename]
    else:
        return 'Incompatible File'


def save_processed(img_data, img_name):
    curr_pro_img_path = join(PROCESSED_FOLDER, img_name)
    if isdir(PROCESSED_FOLDER):
        processed_image = Image.fromarray(img_data)
        processed_image.save(curr_pro_img_path)
        return curr_pro_img_path
    else:
        makedirs(PROCESSED_FOLDER)
        processed_image = Image.fromarray(img_data)
        processed_image.save(curr_pro_img_path)
        return curr_pro_img_path


def get_original(serial_id):
    uploaded_imgs = listdir(UPLOAD_FOLDER)
    selected_img = ''

    for i in uploaded_imgs:
        curr_img = i.rsplit('.', 1)[0]
        if serial_id == curr_img:
            selected_img = join(UPLOAD_FOLDER, i)
            break
        else:
            selected_img = 'original image not found'

    return selected_img


def get_segmented(serial_id):
    seg_imgs = listdir(PROCESSED_FOLDER)
    selected_img = ''

    for j in seg_imgs:
        curr_img = j.rsplit('.', 1)[0]
        if serial_id == curr_img:
            selected_img = join(PROCESSED_FOLDER, j)
            break
        else:
            selected_img = 'original image not found'

    return selected_img
