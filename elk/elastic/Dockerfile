FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.1

USER root

RUN apt install -y openssl

RUN mkdir -p ./myssl/certs ./myssl/private ./data
RUN chmod -R 777 ./myssl/certs ./myssl/private ./data

RUN openssl req -x509 -nodes -out ./myssl/certs/elasticsearch.crt \
    -keyout ./myssl/private/elasticsearch.key \
    -subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elastic"

USER elasticsearch