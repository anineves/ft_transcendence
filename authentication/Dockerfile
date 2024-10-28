FROM python:3.11.3-alpine3.18
LABEL maintainer="anineves@gmail.com"

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create required directories
RUN mkdir -p /auth /scripts /data/web/static /data/web/media

# Copy the relevant directories into the container
COPY ./auth /auth
COPY ./scripts /scripts

WORKDIR /auth

EXPOSE 8000

# Install dependencies, add user, and set permissions
RUN python -m venv /venv && \
  /venv/bin/pip install --upgrade pip && \
  /venv/bin/pip install -r /auth/requirements.txt && \
  adduser --disabled-password --no-create-home duser && \
  chown -R duser:duser /venv /auth /scripts /data && \
  chmod -R 777 /data/web/static /data/web/media && \ 
  chmod -R 755 /scripts && \  
  chmod +x /scripts/commands.sh

# Set environment PATH
ENV PATH="/scripts:/venv/bin:$PATH"

# Switch to non-root user
#USER duser

# Specify the entrypoint
CMD ["sh", "/scripts/commands.sh"]