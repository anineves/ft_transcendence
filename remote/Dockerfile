# Use uma imagem base com Python
FROM python:3.11-slim

# Defina o diretório de trabalho
WORKDIR /app

# Copie o arquivo de requisitos para o container
COPY requirements.txt .

# Instale as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copie o restante do código da aplicação
COPY . .

# Expõe a porta padrão do Django
EXPOSE 8001

# Comando para iniciar o servidor Django
CMD ["gunicorn", "remote.asgi:application", "--bind", "0.0.0.0:8001"]
