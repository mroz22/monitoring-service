FROM debian:jessie

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV appDir /var/www/app/current

RUN apt-get update

RUN apt-get install -y -q --no-install-recommends \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    g++ \
    gcc \
    git \
    make \
    nginx \
    sudo \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get -y autoclean

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 9.5.0

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN mkdir -p /var/www/app/current

WORKDIR ${appDir}

ADD package.json ./
RUN npm i --production

RUN npm install -g nodemon

ADD . /var/www/app/current

#RUN ["chmod", "+x", "wait-for-it.sh"]

EXPOSE 3000

CMD ["npm", "start"]
