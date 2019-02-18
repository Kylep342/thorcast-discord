FROM node:11.9.0

# setup of client
ADD . /app
WORKDIR /app
RUN npm install

# run client
CMD node thorcast-discord.js