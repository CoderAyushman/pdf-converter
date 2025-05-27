FROM node:21.6.2-alpine

WORKDIR /

# Copy application files
COPY . .

# Install Node.js dependencies
RUN npm install

# Install Java and LibreOffice
RUN apk add --no-cache openjdk8-jre libreoffice

# Run the app
CMD ["node", "app.js"]
