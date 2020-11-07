from app.process.outline import *
from os.path import join, dirname, realpath, isdir, split
from PIL import Image, ImageColor

base_path = split(dirname(realpath(__file__)))
TEST_FOLDER = join(base_path[0], 'test', 'test_dirs_support')
ORIGINAL_TEST_IMAGE_FILE = 'test1Orig.png'
SEGMENTED_TEST_IMAGE_FILE = 'test1Segmented.png'
OUTLINED_TEST_IMAGE_FILE = 'test1Outlined.png'


def test_get_outline():
    img = Image.open(TEST_FOLDER + "/" + SEGMENTED_TEST_IMAGE_FILE)
    outline = get_outline(img, '#550000')
    sOutline = set(outline)

    assert len(outline) > 0  # fails if no outline is returned
    assert len(outline) == len(sOutline)  # fails if duplicate coorinates are returned


def test_paste_outline():
    img = Image.open(TEST_FOLDER + "/" + SEGMENTED_TEST_IMAGE_FILE)
    refImage = Image.open(TEST_FOLDER + "/" + OUTLINED_TEST_IMAGE_FILE)
    outline = get_outline(img, '#550000')
    compImg = paste_outline(img, outline, "#ffffff", 0)
    rows = compImg.size[0]
    columns = compImg.size[1]

    isTheSame = True
    for r in range(0, rows, 1):
        for c in range(0, columns, 1):

            if compImg.getpixel((r, c)) != refImage.getpixel((r, c)):
                isTheSame = False

    assert isTheSame  # fails if the image returned from paste_outline() differs from the stored test image by 1 or more pixel value
