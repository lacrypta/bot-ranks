FROM node:20.13.1-alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

RUN pnpm prisma-generate

COPY . .

CMD ["pnpm", "dev"]
