# pull official base image
FROM node:15

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN export NODE_OPTIONS=--max_old_space_size=8192
RUN npm install
RUN npm install react-scripts@3.4.1 -g
# RUN npm i -D --save-exact mini-css-extract-plugin@2.4.6

# add app
COPY . ./

RUN yarn build

# stage 2 - build the final image and copy the react build files
FROM nginx:1.17.8-alpine
COPY --from=0 /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]