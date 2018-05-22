import tarfile


if __name__ == '__main__':
    filename = 'data/instance-level_human_parsing.tar.gz'
    print('Extracting {}...'.format(filename))
    with tarfile.open(filename) as tar:
        tar.extractall('data')


