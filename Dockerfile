# Imagen del backend AquaChile (contexto: raíz del repositorio)
FROM node:22-alpine

WORKDIR /app

# Dependencias primero para aprovechar la caché de capas
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Código del backend
COPY backend/ ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
