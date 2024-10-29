#!/bin/sh

echo "Waiting Kibana to initialize..."

# Creating Nginx Dashboard
echo "Creating Nginx Logs Dashboard..."

# Create the Dashboard for Nginx
DASHBOARD_NGINX=$(curl -X POST "https://localhost:5601/api/saved_objects/dashboard" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
        "attributes": {
            "title": "Nginx Logs Dashboard",
            "timeRestore": false,
            "description": "Dashboard to monitor Nginx logs",
            "version": 1
        }
    }')

# Extract the ID of the Dashboard created for nginx
DASHBOARD_NGINX_ID=$(echo $DASHBOARD_NGINX | jq -r '.id')

echo "Dashboard ID: $DASHBOARD_NGINX_ID"

# Creating data-view for logstash
echo "Creating Data View for logstash-*..."

DATA_VIEW_NGINX=$(curl -X POST "https://localhost:5601/api/data_views/data_view" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
        "data_view": {
            "title": "logstash-*",
            "name": "Nginx Logs",
            "timeFieldName": "@timestamp"
        }
    }')

DATA_VIEW_NGINX_ID=$(echo $DATA_VIEW_NGINX | jq -r '.data_view.id')

sleep 5

echo "Dashboard and Data View created successfully!"

# Create the visualization for Nginx
echo "Creating Nginx Visualization..."

VISUALIZATION_NGINX=$(curl -X POST "https://localhost:5601/api/saved_objects/visualization" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
        "attributes": {
            "title": "Nginx Status Codes",
            "visState": "{\"title\":\"Nginx Status Codes\",\"type\":\"histogram\",\"params\":{\"type\":\"histogram\"},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"status\",\"order\":\"desc\",\"size\":5}}]}",
            "uiStateJSON": "{}",
            "description": "Shows the distribution of HTTP status codes",
            "version": 1,
            "kibanaSavedObjectMeta": {
                "searchSourceJSON": "{\"index\":\"logstash-*\",\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
            }
        }
    }')

# Extract the ID of Visualization created for nginx
VISUALIZATION_NGINX_ID=$(echo $VISUALIZATION_NGINX | jq -r '.id')

echo "Visualization ID: $VISUALIZATION_NGINX_ID"

# Update Dashboard with the visualization Nginx created
echo "Adding Visualization to the Dashboard..."

curl -X PUT "http://localhost:5601/api/saved_objects/dashboard/${DASHBOARD_NGINX_ID}" \
    -H "Content-Type: application/json" \
    -H "kbn-xsrf: true" \
    -d '{
        "attributes": {
            "panelsJSON": "[{\"panelIndex\":\"1\",\"gridData\":{\"x\":0,\"y\":0,\"w\":24,\"h\":15,\"i\":\"1\"},\"version\":\"7.13.0\",\"embeddableConfig\":{},\"type\":\"visualization\",\"id\":\"'${VISUALIZATION_NGINX_ID}'\"}]"
        }
    }'