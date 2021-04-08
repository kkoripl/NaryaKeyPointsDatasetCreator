import json

from flask import Flask, request, jsonify
from flask_cors import CORS

from app.services.tracker_service import TrackerService

app = Flask(__name__)
tracker_service = TrackerService()
CORS(app)

@app.route('/get-bboxes', methods=['POST'])
def get_bboxes():
    images = request.files
    target_img_size = json.loads(request.args.get('targetImgSize'))
    return jsonify(tracker_service.predict_img_bboxes(images, target_img_size))

if __name__ == '__main__':
    app.run()
