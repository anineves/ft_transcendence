echo "Aguardando Elasticsearch ficar pronto..."

# Espera o Elasticsearch estar disponível na porta 9200
until curl -k -u "elastic:elastic" http://localhost:9200 -o /dev/null; do
    sleep 5
    echo "Esperando Elasticsearch..."
done

echo "Criando role e associando ao usuário..."

# Criar role
curl -k -X POST "http://localhost:9200/_security/role/my_monitoring_role" -u "elastic:elastic" -H "Content-Type: application/json" -d '{
  "cluster": ["monitor", "manage"],
  "indices": [
    {
      "names": ["*"],
      "privileges": ["read", "write", "monitor"]
    }
  ]
}'

# Atribuir role ao usuário
curl -k -X POST "http://localhost:9200/_security/user/myuser/_roles" -u "elastic:elastic" -H "Content-Type: application/json" -d '{
  "roles": ["my_monitoring_role"]
}'

echo "Role criada e associada ao usuário com sucesso."