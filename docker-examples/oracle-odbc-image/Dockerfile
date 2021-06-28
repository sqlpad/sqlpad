# Download & Unpack oracle stuff in a seperate image this reduces the amount of downloads if you change the script around
FROM alpine:latest as oracleunpack
RUN apk add --no-cache bash unzip wget \
    && echo "Downloading Oracle Instant Client lite and ODBC drivers." 1>&2 \
    && wget -q -O /opt/client.zip https://download.oracle.com/otn_software/linux/instantclient/211000/instantclient-basiclite-linux.x64-21.1.0.0.0.zip \
    && wget -q -O /opt/odbc.zip https://download.oracle.com/otn_software/linux/instantclient/211000/instantclient-odbc-linux.x64-21.1.0.0.0.zip
    
RUN cd /opt \
    && unzip -q client.zip \
    && unzip -q odbc.zip \
    && rm client.zip odbc.zip

FROM sqlpad/sqlpad:odbc
# Oracle instant client & odbc driver
COPY --from=oracleunpack /opt /opt
COPY generate-tnsnames.sh /etc/docker-entrypoint.d/generate-tnsnames.sh

# Setup some oracle bullshit
ENV TNS_ADMIN=/opt/instantclient_21_1/network/admin
ENV LD_LIBRARY_PATH=/opt/instantclient_21_1
# Install the driver for oracle into ODBC.
RUN cd /opt/instantclient_21_1 && /opt/instantclient_21_1/odbc_update_ini.sh /

# Testing
ENV SQLPAD_AUTH_DISABLED=true
ENV SQLPAD_AUTH_DISABLED_DEFAULT_ROLE=admin