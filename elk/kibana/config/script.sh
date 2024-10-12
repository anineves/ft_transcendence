#!/bin/bash

echo "Waiting Kibana initialize..."

echo "Trying to connect to Kibana..."

echo "Kibana running, creating data view..."

curl -X POST https://localhost:5601/api/data_views/data_view \
    -H "Content-Type: application/json; Elastic-Api-Version=2023-10-31" \
    -H "kbn-xsrf: string" \
    -d '{
        "data_view": {
            "title": "logstash-*",
            "timeFieldName": "@timestamp"
        }
    }'

echo "Data view created!"