export FLASK_APP=$PWD/app/__init__.py
export FLASK_ENV=development
source $(pipenv --venv)/bin/activate
flask run -h 0.0.0.0
