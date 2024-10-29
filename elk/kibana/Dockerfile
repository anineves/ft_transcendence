FROM docker.elastic.co/kibana/kibana:8.15.1

EXPOSE 5601

USER root

RUN apt-get update && apt-get install -y jq

USER kibana
RUN mkdir -p /usr/share/kibana/config/certs
RUN chmod -R 777 /usr/share/kibana/config/certs

RUN openssl req -x509 -nodes -out /usr/share/kibana/config/certs/kibana.crt \
    -keyout /usr/share/kibana/config/certs/kibana.key \
    -subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=kibana"

COPY /config/kibana.yml /usr/share/kibana/config/kibana.yml

COPY /config/script.sh /usr/share/kibana/script.sh

#CMD ["/bin/sh", "-c", "/usr/share/kibana/script.sh" ]