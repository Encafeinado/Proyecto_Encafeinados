
# Utilizar una imagen base de Node.js
FROM node:16-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación NestJS
RUN npm run build

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Definir el comando por defecto para iniciar la aplicación
CMD ["npm", "run", "start:prod"]
