#! /bin/bash

/usr/share/elasticsearch/bin/elasticsearch-users useradd myuser -p "LLLvFuc4q1V6bzi9mU1P" -r myuser

#cat <<EOF | /usr/share/elasticsearch/bin/elasticsearch-setup-roles
#my_monitoring_role:
#  cluster: ["monitor", "manage"]
#  indices:
#    - names: ["*"]
#      privileges: ["read", "write", "monitor"]
#EOF
#
#/usr/share/elasticsearch/bin/elasticsearch-users roles myuser my_monitoring_role

#/usr/share/elasticsearch/config/roles.yml