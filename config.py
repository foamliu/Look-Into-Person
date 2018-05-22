img_rows, img_cols = 320, 320
img_rows_half, img_cols_half = 160, 160
channel = 3
batch_size = 14
epochs = 1000
patience = 50
num_train_samples = 28280
num_valid_samples = 5000

# bgr     others      ceiling        floor            wall            column          beam             window         door            table         chair          bookcase       sofa           board           clutter
colors = [[0, 0, 0], [86, 233, 234], [218, 166, 104], [75, 123, 190], [163, 173, 89], [137, 156, 246], [72, 185, 81], [64, 144, 113], [83, 84, 84], [127, 48, 41], [45, 43, 238], [115, 39, 99], [127, 116, 84], [236, 235, 235]]

num_classes = 20
