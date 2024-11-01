FROM docker.elastic.co/elasticsearch/elasticsearch:8.15.1

#ENV ELASTIC_USERNAME=elastic
#ENV ELASTIC_PASSWORD=elastic

USER root

RUN apt update && apt install -y openssl

COPY ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
COPY ./config/roles.yml /usr/share/elasticsearch/config/roles.yml
COPY ./config/role_mapping.yml /usr/share/elasticsearch/config/role_mapping.yml

RUN chmod -R 777 /usr/share/elasticsearch/config/elasticsearch.yml
RUN chmod -R 777 /usr/share/elasticsearch/config/role_mapping.yml
RUN chmod -R 777 /usr/share/elasticsearch/config/roles.yml

COPY setup_password.sh /usr/share/elasticsearch/setup_password.sh
COPY create_role.sh /usr/share/elasticsearch/create_role.sh
RUN chmod +x /usr/share/elasticsearch/setup_password.sh /usr/share/elasticsearch/create_role.sh
RUN /usr/share/elasticsearch/setup_password.sh



RUN mkdir -p /usr/share/elasticsearch/config/certs
RUN chmod -R 777 /usr/share/elasticsearch/config/certs ./data

RUN openssl req -x509 -nodes -out /usr/share/elasticsearch/config/certs/elasticsearch.crt \
-keyout /usr/share/elasticsearch/config/certs/elasticsearch.key \
-subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elk"

RUN openssl req -x509 -nodes -out /usr/share/elasticsearch/config/certs/kibana.crt \
-keyout /usr/share/elasticsearch/config/certs/kibana.key \
-subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elk"

RUN openssl req -x509 -nodes -out /usr/share/elasticsearch/config/certs/logstash.crt \
-keyout /usr/share/elasticsearch/config/certs/logstash.key \
-subj "/C=PT/ST=OPO/L=PT/O=42/UNIT=42/CN=elk"

RUN chmod -R 777 /usr/share/elasticsearch/config/certs
RUN openssl genrsa -out /usr/share/elasticsearch/config/certs/ca.key 2048
RUN openssl req -x509 -new -nodes -key /usr/share/elasticsearch/config/certs/ca.key -sha256 -days 1024 -out /usr/share/elasticsearch/config/certs/ca.crt -subj "/C=PT/ST=Porto/L=OPO/O=42/OU=42/CN=elk"


USER elasticsearch

# Comecar a colocar os certificados todos no mesmo docker e depois compartilhar atraves do volume com os restantes
# colocar o user kibana_system ou configurar um user costumizado com permissoes
# bloqueios neste momento com o ssl mas talvez seja resolvido com a primeira linha desta comentario
