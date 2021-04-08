from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import cv2
import mxnet as mx
import numpy as np
from gluoncv.data.transforms.presets.ssd import transform_test

"""Builds the preprocessing function for each model. They all use torch/keras/gluoncv functions depending on the model.
Arguments:
    input_shape: Tuple of integer, the input_shape the model needs to take
Returns:
    preprocessing: function that takes an image as input, and returns the preprocessed image.
"""


def _build_tracking_preprocessing(input_shape):
    """Builds the preprocessing function for the Player/Ball Tracking Model.

    """

    def preprocessing(input_img, **kwargs):

        to_normalize = False if np.percentile(input_img, 98) > 1.0 else True

        if len(input_img.shape) == 4:
            print(
                "Only preprocessing single image, we will consider the first one of the batch"
            )
            image = input_img[0] * 255.0 if to_normalize else input_img[0] * 1.0
        else:
            image = input_img * 255.0 if to_normalize else input_img * 1.0

        image = cv2.resize(image, input_shape)
        x, _ = transform_test(mx.nd.array(image), min(input_shape))
        return x

    return preprocessing
