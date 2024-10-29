FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.1

#ENV ELASTIC_USERNAME=elastic
#ENV ELASTIC_PASSWORD=elastic

USER root

RUN apt update && apt install -y openssl

USER elasticsearch

RUN mkdir -p /usr/share/elasticsearch/config/certs
RUN chmod -R 777 /usr/share/elasticsearch/config/certs ./data

RUN openssl req -x509 -nodes -out /usr/share/elasticsearch/config/certs/elasticsearch.crt \
    -keyout /usr/share/elasticsearch/config/certs/elasticsearch.key \
    -subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elastic"


COPY ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

#USER elasticsearch