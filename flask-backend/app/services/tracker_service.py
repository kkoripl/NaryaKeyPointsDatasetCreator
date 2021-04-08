import configparser

import cv2.cv2 as cv2
import mxnet as mx
import numpy as np
import tensorflow as tf
from werkzeug.datastructures import FileStorage

from ..models.gluon_models import TrackerModel


class TrackerService(object):
    def __init__(self):
        config = self._load_config()
        ctx = [mx.cpu()]
        self.model = TrackerModel(pretrained=True, backbone=config['model_backbone'], ctx=ctx)

        WEIGHTS_PATH = (config['pretrained_weights_path'])
        WEIGHTS_NAME = config['weights_name']
        WEIGHTS_TOTAR = config.getboolean('weights_totar')

        checkpoints = tf.keras.utils.get_file(WEIGHTS_NAME, WEIGHTS_PATH, WEIGHTS_TOTAR)

        self.model.load_weights(checkpoints)
        self.model_classes = self.model.classes
        self.prob_threshold = float(config['probability_threshold'])
        self.pred_img_size = (int(config['prediction_image_width']), int(config['prediction_image_height']))
        self.split_size = int(config['split_size'])

    def _load_config(self):
        config = configparser.ConfigParser()
        config.read('tracker_config.ini')
        return config['tracker']

    def predict_img_bboxes(self, images, target_img_size):
        imgs_bboxes = []
        for img_name in images.keys():
            img = self._prepare_img(images[img_name], self.pred_img_size)
            cids, scores, bboxes = self._predict_bboxes(img, self.split_size)
            cids, bboxes = self._filter(cids, scores, bboxes, self.prob_threshold)

            img_bboxes = []
            for cid, bbox in zip(cids, bboxes):
                img_bboxes.append(self._build_bbox_json(bbox, cid, target_img_size))
            imgs_bboxes.append(self._build_img_bboxes_json(img_name, img_bboxes))

        return imgs_bboxes

    def _predict_bboxes(self, img, split_size):
        return self.model(img, split_size=split_size)

    def _prepare_img(self, img: FileStorage, dest_size):
        cv2img = self._read_image_from_request(img)
        return cv2.resize(cv2img, dest_size)

    def _read_image_from_request(self, img: FileStorage):
        filestr = img.read()
        np_img = np.fromstring(filestr, np.uint8)
        return cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    def _filter(self, cids, scores, bboxes, threshold):
        scores_mask = scores > threshold
        cids = cids[scores_mask]
        bboxes = bboxes[0, scores_mask.squeeze(), :]
        return cids, bboxes

    def _build_bbox_json(self, bbox, cid, target_img_size):
        scale_x = target_img_size['width'] / self.pred_img_size[0]
        scale_y = target_img_size['height'] / self.pred_img_size[1]

        bbox[0] *= scale_x
        bbox[1] *= scale_y
        bbox[2] *= scale_x
        bbox[3] *= scale_y

        return {
                'label': self.model_classes[int(cid)],
                'x': int(bbox[0]),
                'y': int(bbox[1]),
                'width': abs(int(bbox[2]-bbox[0])),
                'height': abs(int(bbox[3]-bbox[1]))
        }

    def _build_img_bboxes_json(self, img_name, img_bboxes):
        return {'image': img_name, 'bboxes': img_bboxes}
