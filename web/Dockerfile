FROM node:22-alpine AS builder
ARG VITE_BETTER_AUTH_URL
ARG VITE_GO_BACKEND_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL
ENV VITE_GO_BACKEND_URL=$VITE_GO_BACKEND_URL
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=builder /app/dist /usr/share/caddy
EXPOSE 80
CMD ["caddy", "file-server", "--listen", ":80", "--root", "/usr/share/caddy"]
