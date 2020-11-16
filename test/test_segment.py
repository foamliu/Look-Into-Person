from app.process.segnet.segment import img_process
from os.path import join, dirname, realpath, split
import numpy as np

base_path = split(dirname(realpath(__file__)))


def test_one_img_process():
    casual_image = join(base_path[0], 'test', 'test_segment_support/casual_1_test.jpg')
    from_img_process = img_process(casual_image)
    assert from_img_process.shape == (320, 320, 3)

    dress_image = join(base_path[0], 'test', 'test_segment_support/dress.jpg')
    from_img_process = img_process(dress_image)
    assert from_img_process.shape == (320, 320, 3)

    suit_image = join(base_path[0], 'test', 'test_segment_support/suit.jpg')
    from_img_process = img_process(suit_image)
    assert from_img_process.shape == (320, 320, 3)


def test_two_img_process():
    casual_image = join(base_path[0], 'test', 'test_segment_support/casual_1_test.jpg')
    from_img_process = img_process(casual_image)
    uniques = np.unique(from_img_process.reshape(-1, from_img_process.shape[-1]), axis=0)
    assert len(uniques) < 20

    dress_image = join(base_path[0], 'test', 'test_segment_support/dress.jpg')
    from_img_process = img_process(dress_image)
    uniques = np.unique(from_img_process.reshape(-1, from_img_process.shape[-1]), axis=0)
    assert len(uniques) < 20

    suit_image = join(base_path[0], 'test', 'test_segment_support/suit.jpg')
    from_img_process = img_process(suit_image)
    uniques = np.unique(from_img_process.reshape(-1, from_img_process.shape[-1]), axis=0)
    assert len(uniques) < 20
