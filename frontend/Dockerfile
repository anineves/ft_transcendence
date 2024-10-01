FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

RUN apk update && \
    apk add --no-cache openssl

RUN openssl req -x509 -nodes \
    -out /etc/ssl/certs/localhost.crt \
    -keyout /etc/ssl/private/localhost.key \
    -subj "/C=PT/ST=OPO/L=PT/O=42porto/$UNIT=42/CN=localhost/UID=localhost"

#COPY nginx.conf /etc/nginx/sites-available/default
RUN mkdir -p ../logs

RUN chmod -R 755 ../logs

COPY . /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]


