import os

import cv2 as cv
import matplotlib.pylab as plt
import numpy as np
from console_progressbar import ProgressBar
from scipy.interpolate import interp1d
from scipy.signal import gaussian, convolve

from config import num_classes


def compute_class_prior(do_plot=False):
    categories_folder = 'data/instance-level_human_parsing/Training/Category_ids'
    names = [f for f in os.listdir(categories_folder) if f.lower().endswith('.png')]
    num_samples = len(names)
    prior_prob = np.zeros(num_classes)
    pb = ProgressBar(total=num_samples, prefix='Compute class prior', suffix='', decimals=3, length=50, fill='=')
    for i in range(num_samples):
        name = names[i]
        filename = os.path.join(categories_folder, name)
        category = np.ravel(cv.imread(filename, 0))
        counts = np.bincount(category)
        idxs = np.nonzero(counts)[0]
        prior_prob[idxs] += counts[idxs]
        pb.print_progress_bar(i + 1)

    prior_prob = prior_prob / (1.0 * np.sum(prior_prob))

    # Save
    np.save(os.path.join(data_dir, "prior_prob.npy"), prior_prob)

    if do_plot:
        plt.hist(prior_prob, bins=100)
        plt.yscale("log")
        plt.show()


def smooth_class_prior(sigma=5, do_plot=False):
    prior_prob = np.load(os.path.join(data_dir, "prior_prob.npy"))
    # add an epsilon to prior prob to avoid 0 vakues and possible NaN
    prior_prob += 1E-3 * np.min(prior_prob)
    # renormalize
    prior_prob = prior_prob / (1.0 * np.sum(prior_prob))

    # Smooth with gaussian
    f = interp1d(np.arange(prior_prob.shape[0]), prior_prob)
    xx = np.linspace(0, prior_prob.shape[0] - 1, 1000)
    yy = f(xx)
    window = gaussian(2000, sigma)  # 2000 pts in the window, sigma=5
    smoothed = convolve(yy, window / window.sum(), mode='same')
    fout = interp1d(xx, smoothed)
    prior_prob_smoothed = np.array([fout(i) for i in range(prior_prob.shape[0])])
    prior_prob_smoothed = prior_prob_smoothed / np.sum(prior_prob_smoothed)

    # Save
    file_name = os.path.join(data_dir, "prior_prob_smoothed.npy")
    np.save(file_name, prior_prob_smoothed)

    if do_plot:
        plt.plot(prior_prob)
        plt.plot(prior_prob_smoothed, "g--")
        plt.plot(xx, smoothed, "r-")
        plt.yscale("log")
        plt.show()


def compute_prior_factor(gamma=0.5, alpha=1, do_plot=False):
    file_name = os.path.join(data_dir, "prior_prob_smoothed.npy")
    prior_prob_smoothed = np.load(file_name)

    u = np.ones_like(prior_prob_smoothed)
    u = u / np.sum(1.0 * u)

    prior_factor = (1 - gamma) * prior_prob_smoothed + gamma * u
    prior_factor = np.power(prior_factor, -alpha)

    # renormalize
    prior_factor = prior_factor / (np.sum(prior_factor * prior_prob_smoothed))

    file_name = os.path.join(data_dir, "prior_factor.npy")
    np.save(file_name, prior_factor)

    if do_plot:
        plt.plot(prior_factor)
        plt.yscale("log")
        plt.show()


if __name__ == '__main__':
    data_dir = 'data/'
    do_plot = True

    compute_class_prior(do_plot=True)
    smooth_class_prior(do_plot=True)
    compute_prior_factor(do_plot=True)
