from app.process.segnet.segment import img_process
from os.path import join, dirname, realpath, split

base_path = split(dirname(realpath(__file__)))


def test_one_img_process():
    casual_image = join(base_path[0], 'test', 'test_segment_support/casual_1_test.jpg')
    from_img_process = img_process(casual_image)
    assert from_img_process.shape == (320, 320, 3)

