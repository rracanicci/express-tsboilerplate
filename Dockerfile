# use the lts version
FROM node:lts

# directory that will store the application
WORKDIR /usr/app

# install node dependencies (node_modules)
COPY package*.json ./
RUN npm install

# copy application files
COPY . .

# build the application
RUN npm run build

# expose the default application port
EXPOSE 3000

# run the application
CMD [ "npm", "start" ]