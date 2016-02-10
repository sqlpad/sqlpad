FROM debian:jessie

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get dist-upgrade --no-install-recommends -q -o Dpkg::Options::="--force-confold" --force-yes -y \
 && apt-get install --no-install-recommends -q -o Dpkg::Options::="--force-confold" --force-yes -y \
    wget \
    xz-utils \
 && apt-get clean

ENV NODEJS_VERSION __NODEJS_VERSION__
RUN wget --no-check-certificate https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz -O /tmp/node-v${NODEJS_VERSION}-linux-x64.tar.xz \
 && tar --lzma -xvf /tmp/node-v${NODEJS_VERSION}-linux-x64.tar.xz -C /opt \
 && ln -s /opt/node-v${NODEJS_VERSION}-linux-x64/bin/node /usr/bin/node \
 && ln -s /opt/node-v${NODEJS_VERSION}-linux-x64/bin/npm /usr/bin/npm \
 && rm /tmp/node-v${NODEJS_VERSION}-linux-x64.tar.xz

ENV SQLPAD_VERSION __SQLPAD_VERSION__
RUN npm install sqlpad@${SQLPAD_VERSION} -g \
 && ln -s /opt/node-v${NODEJS_VERSION}-linux-x64/bin/sqlpad /usr/bin/sqlpad

WORKDIR /var/lib/sqlpad
COPY docker-entrypoint /
RUN chmod +x /docker-entrypoint
ENTRYPOINT ["/docker-entrypoint"]
