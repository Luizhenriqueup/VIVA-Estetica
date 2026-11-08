FROM node:24-alpine AS frontend-build

WORKDIR /frontend
COPY Front-End/meu-app/package.json Front-End/meu-app/package-lock.json ./
RUN npm ci
COPY Front-End/meu-app/ ./
RUN npm run build

FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY Back-End/package.json Back-End/package-lock.json ./
RUN npm ci
COPY Back-End/ ./
RUN npm run db:generate
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/prisma db push && npm run db:bootstrap-admin && npm start"]

