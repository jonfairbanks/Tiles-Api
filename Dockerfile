FROM node:10

# Set default node environment to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set default node port to 3000, and 9229 and 9230 (tests) for debug
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

# Install latest NPM. Pin to version for stability
RUN npm i npm@latest -g

# Create app directy and set owner to the non root user we will run the app under 
RUN mkdir /opt/node_app && chown node:node /opt/node_app

# Change work directory to app directory
WORKDIR /opt/node_app

# Switch to non root user context
USER node

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --no-optional && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH

# Check service status every 30 seconds
HEALTHCHECK --interval=30s CMD node healthcheck.js

# Copy source code last as it changes most
WORKDIR /opt/node_app/app
COPY . .

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["node", "./bin/www"]

