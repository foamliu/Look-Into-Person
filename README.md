# The Automatic Apparel Outliner Project
For information about using the application, visit out our [project website](https://dboggs0.github.io/AAOsite/).

[ Overview ](#Overview)|[ Running the App Locally ](#Local)|[ Running the App On Your Website ](#Production)

## <a name="Overview">Overview</a>
Automatic Apparel Outliner (AAO) web app is designed to draw outlines around the section of images
containing articles of clothing in photographs.

## <a name="Installation">Installation</a>
### <a name="Local">Running the App Locally</a>
Prerequisites:
* [NodeJS](https://nodejs.org/en/download/)
* [Python3](https://www.python.org/downloads/)


1. Clone the Automatic Apparel Outliner repository and change directories.
    >$ git clone https://github.com/sloanlipman/automatic-apparel-outliner.git

    >$ cd automatic-apparel-outliner

2. Build the Angular project

    >$ npm install -g @angular/cli
    >$ cd web
    >$ npm install
    >$ npm run start


3. Set up a Python virtual environment and install dependencies
    On macOS and Linux:

    >$ cd ..
    >$ python3 -m venv env
    >$ source env/bin/activate
    >$ pip install -r requirements.txt

    On Windows:

    >$ cd ..
    >$ py -m venv env
    >$.\env\Scripts\activate.bat
    >$ pip install -r requirements.txt

4. Start the Flask application.
    >$ flask run

5. Access the application at:
    > http://localhost:5000/home

### <a name="Production">Running the App on Your Website</a>
The following installation instructions assume that you are planning to host the application on your website. We assume that you have access to a virtual machine in which you can build and deploy a Docker image.

1. Clone the Automatic Apparel Outliner repository and change directories.

    >$ git clone https://github.com/sloanlipman/automatic-apparel-outliner.git

    >$ cd automatic-apparel-outliner

2. Run the setup script.

    > For Windows VMs, run .\setup.bat

    > For Linux and Mac VMs, run source setup.sh

    > Follow the prompt in the script to provide the domain name for your VM, including http:// or https:// as applicable.

    > The script will print out Angular's environment configuration file. Make shre that the value for API_URL looks correct.

    > For example, if your domain is http://aao.ninja, you should see something like this: export const environment = {production: true, API_URL: 'http://aao.ninja:12345'};

3. If there are no errors, let the script continue to run. It will build a Docker image and start up the container for you.

4. Once the docker image is running the app can be accessed through a web browser at the following address:

    > http://\<Server IP Address>:12345/home
