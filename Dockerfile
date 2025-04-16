# Gunakan image node
FROM node:18

# Buat direktori kerja
WORKDIR /app

# Copy semua file (kecuali yg di .dockerignore)
COPY . .

# Install dependen backend + bot
RUN npm install

# Default command diganti di docker-compose
CMD ["npm", "run", "api"]