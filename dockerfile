FROM node:16.14.0

# Create app directory
WORKDIR /home/node/app
# Bundle app source
COPY . .
# # Install app dependencies
COPY package.json ./
RUN npm install
RUN npx prisma generate
ENV NODE_PATH=./dist

RUN npm run build