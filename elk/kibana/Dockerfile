FROM docker.elastic.co/kibana/kibana:8.15.1

COPY /config/kibana.yml /usr/share/kibana/config/kibana.yml


COPY /config/script.sh /tmp/

USER root
RUN chmod +x /tmp/script.sh

USER kibana
RUN /tmp/script.sh

EXPOSE 5601
