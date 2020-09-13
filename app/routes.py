from flask import send_from_directory, send_file, request, json
from app import app
from werkzeug.utils import secure_filename
from os.path import join, dirname, realpath

UPLOAD_FOLDER = join(dirname(realpath(__file__)), 'img/uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def json_response(payload, status=200):
    return (json.dumps(payload), status, {'content-type': 'application/json'})


@app.route('/')
@app.route('/home')
def index():
    return send_file('../dist/web/index.html', 'text/html')


@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['image']
        if f and allowed_file(f.filename):
            filename = secure_filename(f.filename)
            f.save(join(app.config['UPLOAD_FOLDER'], filename))
            return json_response({'success': 'true', 'filename': filename})


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('../dist/web', path)
