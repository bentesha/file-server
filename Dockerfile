FROM node:14-alpine

WORKDIR /app

ENV PORT=8000
ENV UPLOAD_DIR='/files/'
ENV RESIZED_IMAGE_DIR='/files/resized/'
ENV RABBITMQ_HOST='localhost'

COPY . /app

RUN apk update && apk add ffmpeg
RUN npm install

EXPOSE ${PORT}

CMD ["node", "index.js"]
