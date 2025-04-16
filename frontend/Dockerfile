FROM node:18

WORKDIR /app

COPY ./frontend/package*.json ./

# Hapus package-lock.json & node_modules dari host agar tidak menyebabkan error rollup
RUN rm -rf package-lock.json node_modules

# Install deps di dalam container
RUN npm install

COPY ./frontend ./

EXPOSE 5173

CMD ["npm", "run", "dev"]
