export FLASK_APP=$PWD/app/__init__.py
export FLASK_ENV=development
source myenv/bin/activate # Change this to the location of your own virtual environment!
pip install -r requirements.txt
flask run -h 0.0.0.0
