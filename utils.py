import tensorflow as tf


def sparse_cross_entropy(y_true, y_pred):
    """
    Calculate the cross-entropy loss between y_true and y_pred.

    y_true is a 3-rank tensor with the desired output.
    The shape is [batch_size, img_rows, img_cols].

    y_pred is the decoder's output which is a 4-rank tensor
    with shape [batch_size, img_rows, img_cols, num_labels]
    so that for each image in the batch there is a one-hot
    encoded array of length num_labels.
    """

    # Calculate the loss. This outputs a
    # 3-rank tensor of shape [batch_size, img_rows, img_cols]
    loss = tf.nn.sparse_softmax_cross_entropy_with_logits(labels=y_true,
                                                          logits=y_pred)

    # Keras may reduce this across the first axis (the batch)
    # but the semantics are unclear, so to be sure we use
    # the loss across the entire 3-rank tensor, we reduce it
    # to a single scalar with the mean function.
    loss_mean = tf.reduce_mean(loss)

    return loss_mean
