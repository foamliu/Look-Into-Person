from os.path import join, dirname, realpath, isdir, split, basename
from app import app
from werkzeug.utils import secure_filename
from os import makedirs
from skimage import io

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
        io.imsave(curr_pro_img_path, img_data)
        return curr_pro_img_path
    else:
        makedirs(PROCESSED_FOLDER)
        io.imsave(curr_pro_img_path, img_data)
        return curr_pro_img_path
