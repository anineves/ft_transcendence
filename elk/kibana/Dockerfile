FROM docker.elastic.co/kibana/kibana:8.15.1

EXPOSE 5601

COPY /config/kibana.yml /usr/share/kibana/config/kibana.yml

COPY /config/script.sh /usr/share/kibana/script.sh

#CMD ["/bin/sh", "-c", "/usr/share/kibana/script.sh" ]