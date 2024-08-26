# Use a base image that includes Node.js
FROM node:18 AS node-build

# Set the working directory for the Node.js application
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the Node.js application code
COPY . .

# Expose the port the Node.js server will run on
EXPOSE 3000

# Use a base image that includes Python 3.11
FROM python:3.11 AS python-build

# Set the working directory for the Flask application
WORKDIR /flask-app

# Copy requirements.txt and install Python dependencies
COPY Mira_Flask_Server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Flask application code
COPY Mira_Flask_Server/ ./

# Expose the port the Flask server will run on
EXPOSE 5000

# Install Supervisor
RUN apt-get update && apt-get install -y supervisor

# Copy the Supervisor configuration file
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

# Set the command to run both servers
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisor.conf"]
