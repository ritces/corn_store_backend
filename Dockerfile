ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy prisma schema first to leverage caching if it doesn't change often
COPY prisma ./prisma/

# Copy tsconfig (needed by ts-node/nodemon)
COPY tsconfig.json ./

# Copy the rest of the application source code
COPY ./src ./src/

# Expose the port the app runs on (get from env or use default)
ARG PORT=3000
EXPOSE ${PORT}


CMD [ "pnpm", "run", "dev" ] 