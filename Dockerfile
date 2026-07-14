FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 5173 for Vite
EXPOSE 5173

# Start the development server (we use sh -c to ensure dependencies are re-installed if volume is mounted without node_modules)
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
