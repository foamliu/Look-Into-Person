from app.tools.dirs import *
from os.path import join, dirname, realpath, split
import cv2.cv2 as cv2
import pytest
import os

base_path = split(dirname(realpath(__file__)))
UPLOAD_FOLDER = join(base_path[0], 'app/img/uploads')
PROCESSED_FOLDER = join(base_path[0], 'app/img/processed')
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
    os.remove(UPLOAD_FOLDER + "/1234.png")
    os.remove(PROCESSED_FOLDER + "/1234.png")


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

# def test_clear_uploads():
#     # print(os.listdir(UPLOAD_FOLDER))
#     clear_uploads()
#     assert len(os.listdir(UPLOAD_FOLDER)) == 0  # upload folder is empty
#     assert len(os.listdir(PROCESSED_FOLDER)) == 0  # processed folder is empty
