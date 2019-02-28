FROM node:11.9.0

# setup of client
COPY . /app
WORKDIR /app
RUN npm install

# run client
ENTRYPOINT ["node", "thorcast-discord.js"]