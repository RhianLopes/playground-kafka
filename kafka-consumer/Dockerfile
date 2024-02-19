FROM node:18-alpine

WORKDIR /usr/src/app

# Install necessary build tools and dependencies
RUN apk add --no-cache python3 make g++ bash

# Set environment variables for Python
ENV PYTHON=/usr/bin/python3
ENV PYTHON_PIP=/usr/bin/pip3

COPY package*.json ./
RUN npm install --no-update-notifier --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
