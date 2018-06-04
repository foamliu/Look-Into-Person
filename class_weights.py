import os

import cv2 as cv
import numpy as np
from console_progressbar import ProgressBar

if __name__ == '__main__':
    train_images_folder = 'data/instance-level_human_parsing/Training/Images'
    train_categories_folder = 'data/instance-level_human_parsing/Training/Category_ids'
    id_file = 'data/instance-level_human_parsing/Training/train_id.txt'
    with open(id_file, 'r') as f:
        names = f.read().splitlines()

    num_samples = len(names)

    pb = ProgressBar(total=num_samples, prefix='Processing images', suffix='', decimals=3, length=50, fill='=')

    lbl_counts = {}
    for i in range(num_samples):
        name = names[i]
        filename = os.path.join(train_categories_folder, name + '.png')
        semantic = cv.imread(filename)
        id, counts = np.unique(semantic, return_counts=True)
        # normalize on image
        counts = counts / float(sum(counts))
        for j in range(len(id)):
            if id[j] in lbl_counts.keys():
                lbl_counts[id[j]] += counts[j]
            else:
                lbl_counts[id[j]] = counts[j]

        pb.print_progress_bar(i + 1)

    # normalize on training set
    for k in lbl_counts.keys():
        lbl_counts[k] /= num_samples

    print("##########################")
    print("class probability:")
    for k in lbl_counts.keys():
        print("%i: %f" % (k, lbl_counts[k]))
    print("##########################")

    # normalize on median freuqncy
    med_frequ = np.median(lbl_counts.values())
    lbl_weights = {}
    for k in lbl_counts:
        lbl_weights[k] = med_frequ / lbl_counts[k]

    print("##########################")
    print("median frequency balancing:")
    for k in lbl_counts:
        print("%i: %f" % (k, lbl_weights[k]))
    print("##########################")

    # class weight for classes that are not present in labeled image
    missing_class_weight = 100000

    max_class_id = np.max(lbl_weights.keys()) + 1

    # print formated output for caffe prototxt
    print("########################################################")
    print("### caffe SoftmaxWithLoss format #######################")
    print("########################################################")
    print("  loss_param: {\n"
          "    weight_by_label_freqs: true")
    # "\n    ignore_label: 0"
    for k in range(max_class_id):
        if k in lbl_weights:
            print("    class_weighting:", lbl_weights[k])
        else:
            print("    class_weighting:", missing_class_weight)
    print("  }")
    print("########################################################")

    weights = []
    for k in range(max_class_id):
        weights.append(lbl_weights[k])
    np.save('median_class_weights.npy', np.array(weights))
