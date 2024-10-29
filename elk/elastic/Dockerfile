FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.1

USER root

RUN apt install -y openssl
USER elasticsearch
RUN mkdir -p /usr/share/elasticsearch/myssl/certs /usr/share/elasticsearch/myssl/private
RUN chmod -R 777 /usr/share/elasticsearch/myssl/certs /usr/share/elasticsearch/myssl/private ./data

RUN openssl req -x509 -nodes -out ./myssl/certs/elasticsearch.crt \
    -keyout ./myssl/private/elasticsearch.key \
    -subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elastic"

COPY ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

#USER elasticsearch