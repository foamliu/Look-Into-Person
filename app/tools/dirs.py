from os.path import join, dirname, realpath, isdir, split
from werkzeug.utils import secure_filename
from os import makedirs, listdir, walk, sep, remove
import cv2.cv2 as cv2
import zipfile

base_path = split(dirname(realpath(__file__)))
IMG_FOLDER = join(base_path[0], 'img')
UPLOAD_FOLDER = join(base_path[0], 'img', 'uploads')
OUTLINED_UPLOAD_FOLDER = join(base_path[0], 'img', 'uploads', 'outlined')
PROCESSED_FOLDER = join(base_path[0], 'img', 'processed')
OUTLINED_PROCESSED_FOLDER = join(base_path[0], 'img', 'processed', 'outlined')
ZIPPED_FOLDER = join(base_path[0], 'img', 'zipped')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}


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


# Need Tests
def save_processed_outlined(img_name, orig_image):
    curr_pro_img_path = join(OUTLINED_PROCESSED_FOLDER, img_name)
    if isdir(OUTLINED_PROCESSED_FOLDER):
        orig_image.save(curr_pro_img_path)
        return curr_pro_img_path
    else:
        makedirs(OUTLINED_PROCESSED_FOLDER)
        orig_image.save(curr_pro_img_path)
        return curr_pro_img_path


# Need Tests
def save_upload_outlined(img_name, orig_image):
    curr_upload_img_path = join(OUTLINED_UPLOAD_FOLDER, img_name)
    if isdir(OUTLINED_UPLOAD_FOLDER):
        orig_image.save(curr_upload_img_path)
        return curr_upload_img_path
    else:
        makedirs(OUTLINED_UPLOAD_FOLDER)
        orig_image.save(curr_upload_img_path)
        return curr_upload_img_path


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


# Need Tests
def create_zip(serial_id, file_list):
    orig = file_list[0]
    orig_outline = file_list[1]
    seg = file_list[2]
    seg_outline = file_list[3]
    print(file_list)
    if not isdir(ZIPPED_FOLDER):
        makedirs(ZIPPED_FOLDER)

    zf = zipfile.ZipFile(ZIPPED_FOLDER + sep + serial_id + '.zip', mode='w', compression=zipfile.ZIP_DEFLATED)
    for root, dirs, files in walk(IMG_FOLDER):
        for name in files:
            if name.find(serial_id) > -1:
                full_path = join(root, name)
                path_separated = full_path.split(sep)

                if orig == 'true' and path_separated[len(path_separated) - 2] == 'uploads':
                    zf.write(join(root, name), path_separated[len(path_separated) - 1])
                    continue

                if orig_outline == 'true' and path_separated[len(path_separated) - 3] == 'uploads' and path_separated[
                    len(path_separated) - 2] == 'outlined':
                    zf.write(join(root, name), ''.join('outlined_' + path_separated[len(path_separated) - 1]))
                    continue

                if seg == 'true' and path_separated[len(path_separated) - 2] == 'processed':
                    zf.write(join(root, name), ''.join('segnet_' + path_separated[len(path_separated) - 1]))
                    continue

                if seg_outline == 'true' and path_separated[len(path_separated) - 3] == 'processed' and path_separated[
                    len(path_separated) - 2] == 'outlined':
                    zf.write(join(root, name), ''.join('segnet_outlined_' + path_separated[len(path_separated) - 1]))
                    continue

    zf.close()
    return ZIPPED_FOLDER + sep + serial_id + '.zip'


def cleanup(serial_id):
    for root, dirs, files in walk(IMG_FOLDER):
        for name in files:
            if name.find(serial_id) > -1:
                full_path = join(root, name)
                remove(full_path)
