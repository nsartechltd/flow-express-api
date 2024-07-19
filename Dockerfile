FROM --platform=linux/amd64 node:20-alpine

COPY . .

RUN npm ci
RUN npm run build

CMD ["node", "dist/app.js"]