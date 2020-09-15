from flask import send_from_directory, send_file, request, json
from app import app
from app.process.seg import img_process
from app.tools.dirs import save_upload, save_processed


def json_response(payload, status=200):
    return json.dumps(payload), status, {'content-type': 'application/json'}


@app.route('/')
@app.route('/home')
def index():
    return send_file('../dist/web/index.html', 'text/html')


# delete img after processing
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['image']
        fileinfo = save_upload(f)
        img_data = img_process(fileinfo[0])
        pro_img = save_processed(img_data, fileinfo[1])
        return send_file(pro_img)


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/web', path)
