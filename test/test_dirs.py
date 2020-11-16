from app.tools.dirs import *
from os.path import join, dirname, realpath, split
import cv2.cv2 as cv2
import pytest
import os
from PIL import Image

base_path = split(dirname(realpath(__file__)))
UPLOAD_FOLDER = join(base_path[0], 'app/img/uploads')
PROCESSED_FOLDER = join(base_path[0], 'app/img/processed')
ZIPPED_FOLDER = join(base_path[0], 'app/img/zipped')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

TEST_FOLDER = join(base_path[0], 'test', 'test_dirs_support')
ORIGINAL_TEST_IMAGE_FILE = 'test1Orig.png'
SEGMENTED_TEST_IMAGE_FILE = 'test1Segmented.png'
OUTLINED_TEST_IMAGE_FILE = 'test1Outlined.png'


@pytest.fixture
def setup_test_image():
    image = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload(image, "1234.png")
    files = os.listdir(UPLOAD_FOLDER)


@pytest.fixture(scope='session', autouse=True)
def remove_test_images():
    yield 'teardown'
    if "1234.png" in os.listdir(UPLOAD_FOLDER):
        os.remove(UPLOAD_FOLDER + "/1234.png")
    if "1234.png" in os.listdir(PROCESSED_FOLDER):
        os.remove(PROCESSED_FOLDER + "/1234.png")
    if "1234.png" in os.listdir(join(PROCESSED_FOLDER, "outlined")):
        os.remove(join(PROCESSED_FOLDER, "outlined" , "1234.png"))
    if "1234.png" in os.listdir(join(UPLOAD_FOLDER, "outlined" )):
        os.remove(join(UPLOAD_FOLDER, "outlined" , "1234.png"))
    if "1234.zip" in os.listdir(ZIPPED_FOLDER):
        os.remove(ZIPPED_FOLDER + "/1234.zip")

def test_allowed_file():
    for f in ALLOWED_EXTENSIONS:
        assert allowed_file("1234." + f)


def test_save_upload():
    image = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload(image, "1234.png")
    files = os.listdir(UPLOAD_FOLDER)
    assert "1234.png" in files


def test_save_processed():
    image = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_processed(image, "1234.png")
    files = os.listdir(PROCESSED_FOLDER)
    assert "1234.png" in files


def test_get_original(setup_test_image):
    img = get_original('1234')
    assert img != 'original image not found'

def test_cleanup():
    image = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload(image, "1234.png")
    cleanup('1234')
    files = os.listdir(UPLOAD_FOLDER)
    isPresent = "1234.png" in files
    assert not isPresent

def test_save_processed_outlined():
    image = Image.open(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_processed_outlined("1234.png", image)
    files = os.listdir(join(base_path[0], 'app/img/processed/outlined'))
    isPresent = "1234.png" in files
    print(files)
    assert isPresent

def test_save_upload_outlined():
    image = Image.open(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload_outlined("1234.png", image)
    files = os.listdir(join(base_path[0], 'app/img/uploads/outlined'))
    isPresent = "1234.png" in files
    print(files)
    assert isPresent


def test_create_zip():
    #create_zip(serial_id, file_list)
    imgOriginal = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload(imgOriginal, "1234.png")

    imgSegmented = cv2.imread(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_processed(imgSegmented, "1234.png")

    imgOriginalOutlined = Image.open(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_upload_outlined("1234.png", imgOriginalOutlined)

    imgSegmentedOutlined = Image.open(TEST_FOLDER + "/" + ORIGINAL_TEST_IMAGE_FILE)
    save_processed_outlined("1234.png", imgSegmentedOutlined)

    fileList = [imgOriginal, imgSegmented, imgOriginalOutlined, imgSegmentedOutlined]
    create_zip('1234', fileList)

    assert "1234.zip" in os.listdir(ZIPPED_FOLDER)

