# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json/npm-shrinkwrap.json if available
COPY package*.json ./

# Install dependencies including devDependencies (needed for typescript build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy package.json and only install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy only the compiled code from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables (can be overridden by docker run or docker-compose)
ENV PORT=10000
ENV NODE_ENV=production

# Expose the application port
EXPOSE 10000

# Start the application
CMD ["node", "dist/server.js"]
