FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 5001

CMD ["npm", "start"] 