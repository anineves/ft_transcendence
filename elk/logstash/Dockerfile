FROM docker.elastic.co/logstash/logstash:8.15.1

#delete default config
RUN rm -f /usr/share/logstash/pipeline/longstash.conf

# copy configuration
COPY pipeline/ /usr/share/logstash/pipeline/

COPY config /usr/share/logstash/config/