#!/bin/sh

echo "Waiting Kibana initialize..."

#until $(curl --output /dev/null --silent --head --fail http://localhost:5601); do
#  echo "Trying to connect to Kibana..."
#  sleep 2
#done

echo "Kibana running, creating data view..."

curl -X POST "http://localhost:5601/api/data_views/data_view" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
        "data_view": {
            "title": "logstash-*",
            "name": "Nginx Logs",
            "timeFieldName": "@timestamp"
        }
    }'

echo "Data view created!"