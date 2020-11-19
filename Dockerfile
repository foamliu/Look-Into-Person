# Set up the environment
FROM ubuntu:latest
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ = America_New/York

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        wget \
        python3 \
        python3-pip \
        ca-certificates \
        libgl1-mesa-glx \
        libsm6 \
        libxrender-dev \
        libxext6 \
        curl && \
    rm -rf /var/lib/apt/lists/* && \
# Install nodejs
    curl -sL https://deb.nodesource.com/setup_12.x | bash && \
    apt-get install -y --no-install-recommends \
    nodejs && \
    mkdir automatic-apparel-outliner

# Copy the main project into the docker image
WORKDIR /usr/src/app/automatic-apparel-outliner
COPY . .

# Change working directory to the project and install dependencies
RUN for req in $(cat ./requirements.txt) pydot; do pip3 install $req; done
# Get the model
RUN mkdir ./app/process/segnet/models
RUN wget https://github.com/sloanlipman/Look-Into-Person/releases/download/v1.1/model.11-0.8409.hdf5 && mv model.11-0.8409.hdf5 ./app/process/segnet/models/

# Build the Angular project
WORKDIR /usr/src/app/automatic-apparel-outliner/web
RUN npm ci
RUN npm run build

# Deploy the application on port 8080
WORKDIR /usr/src/app/automatic-apparel-outliner
EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
