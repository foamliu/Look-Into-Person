from os.path import join, dirname, realpath, isdir, split
from werkzeug.utils import secure_filename
from os import makedirs, listdir
import cv2.cv2 as cv2

base_path = split(dirname(realpath(__file__)))
UPLOAD_FOLDER = join(base_path[0], 'img/uploads')
PROCESSED_FOLDER = join(base_path[0], 'img/processed')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(image_data, filename):
    if allowed_file(filename):
        filename = secure_filename(filename)
        curr_img_path = join(UPLOAD_FOLDER, filename)
        if isdir(UPLOAD_FOLDER):
            cv2.imwrite(curr_img_path, image_data)
        else:
            makedirs(UPLOAD_FOLDER)
            cv2.imwrite(curr_img_path, image_data)
        return [curr_img_path, filename]
    else:
        return 'Incompatible File'


def save_processed(img_data, img_name):
    curr_pro_img_path = join(PROCESSED_FOLDER, img_name)
    if isdir(PROCESSED_FOLDER):
        cv2.imwrite(curr_pro_img_path, img_data)
        return curr_pro_img_path
    else:
        makedirs(PROCESSED_FOLDER)
        cv2.imwrite(curr_pro_img_path, img_data)
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
