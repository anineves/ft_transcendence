#!/bin/bash

echo "Waiting Kibana initialize..."

while ! curl -s http://localhost:5601 > /dev/null; do
    sleep 15
    echo "Trying to connect to Kibana..."
done

echo "Kibana running, creating data view..."

curl -X POST "http://localhost:5601/api/data_views/data_view" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d '{
        "data_view": {
            "title": "logstash-*",
            "timeFieldName": "@timestamp"
        }
    }'

echo "Data view created!"