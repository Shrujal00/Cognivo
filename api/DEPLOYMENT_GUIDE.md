# 🚀 EduNexus AI - Professional Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Docker Compose**: 2.x or higher
- **Git**: Latest version

### Required Services
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/)
- **Redis**: For caching (optional but recommended)
- **Database**: PostgreSQL or MongoDB (for production)

---

## 🏠 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/edunexus-ai.git
cd edunexus-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,txt,jpg,jpeg,png
```

### 4. Build and Start
```bash
# Build the project
npm run build

# Start development server
npm run dev

# Or start production server
npm start
```

### 5. Verify Installation
```bash
# Health check
curl http://localhost:3000/health

# API documentation
open http://localhost:3000/api-docs
```

---

## 🐳 Docker Deployment

### 1. Build Docker Image
```bash
# Build production image
docker build -t edunexus-ai:latest .

# Or use Docker Compose
docker-compose build
```

### 2. Run with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Environment Variables for Docker
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000
```

### 4. Docker Health Checks
```bash
# Check container health
docker ps

# Check logs
docker logs edunexus-ai

# Execute commands in container
docker exec -it edunexus-ai sh
```

---

## 🌐 Production Deployment

### 1. Server Preparation

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### CentOS/RHEL
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Application Deployment

#### Method 1: Direct Deployment
```bash
# Clone repository
git clone https://github.com/your-org/edunexus-ai.git
cd edunexus-ai

# Install dependencies
npm ci --production

# Build application
npm run build

# Set environment variables
export OPENAI_API_KEY="your_api_key_here"
export NODE_ENV="production"
export PORT="3000"

# Start application
npm start
```

#### Method 2: Docker Deployment
```bash
# Clone repository
git clone https://github.com/your-org/edunexus-ai.git
cd edunexus-ai

# Create production environment file
cp env.example .env.production

# Edit production environment
nano .env.production

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Process Management

#### Using PM2
```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'edunexus-ai',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Systemd
```bash
# Create systemd service file
sudo nano /etc/systemd/system/edunexus-ai.service
```

```ini
[Unit]
Description=EduNexus AI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/edunexus-ai
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable edunexus-ai
sudo systemctl start edunexus-ai
sudo systemctl status edunexus-ai
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### Using ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker build -t edunexus-ai .
docker tag edunexus-ai:latest your-account.dkr.ecr.us-east-1.amazonaws.com/edunexus-ai:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/edunexus-ai:latest

# Create ECS task definition and service
aws ecs create-cluster --cluster-name edunexus-ai-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster edunexus-ai-cluster --service-name edunexus-ai-service --task-definition edunexus-ai:1 --desired-count 2
```

#### Using Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create production

# Deploy application
eb deploy
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/edunexus-ai

# Deploy to Cloud Run
gcloud run deploy edunexus-ai --image gcr.io/PROJECT-ID/edunexus-ai --platform managed --region us-central1 --allow-unauthenticated
```

### Azure Deployment

#### Using Container Instances
```bash
# Build and push to ACR
az acr build --registry myregistry --image edunexus-ai .

# Deploy to Container Instances
az container create --resource-group myResourceGroup --name edunexus-ai --image myregistry.azurecr.io/edunexus-ai:latest --cpu 1 --memory 1 --registry-login-server myregistry.azurecr.io --registry-username myusername --registry-password mypassword --dns-name-label edunexus-ai --ports 3000
```

---

## 📊 Monitoring & Maintenance

### 1. Health Monitoring

#### Health Check Endpoints
```bash
# Basic health check
curl http://localhost:3000/health

# Detailed health check
curl http://localhost:3000/health/detailed

# Metrics endpoint
curl http://localhost:3000/metrics
```

#### Monitoring with Prometheus
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'edunexus-ai'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

### 2. Log Management

#### Log Configuration
```bash
# Create logs directory
mkdir -p logs

# Set up log rotation
sudo nano /etc/logrotate.d/edunexus-ai
```

```
/opt/edunexus-ai/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload edunexus-ai
    endscript
}
```

### 3. Performance Monitoring

#### Key Metrics to Monitor
- **Response Time**: Average API response time
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Memory Usage**: Heap and RSS memory consumption
- **CPU Usage**: CPU utilization percentage
- **Cache Hit Rate**: Redis cache performance

#### Setting Up Alerts
```yaml
# alert_rules.yml
groups:
  - name: edunexus-ai
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs edunexus-ai

# Check environment variables
env | grep OPENAI

# Verify port availability
netstat -tulpn | grep :3000

# Check Node.js version
node --version
```

#### 2. OpenAI API Errors
```bash
# Verify API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check rate limits
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/usage
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 4. Docker Issues
```bash
# Check Docker status
docker ps
docker logs edunexus-ai

# Clean up Docker
docker system prune -a

# Rebuild image
docker-compose build --no-cache
```

### Performance Optimization

#### 1. Enable Gzip Compression
```javascript
// In your Express app
app.use(compression());
```

#### 2. Implement Caching
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

app.use('/api/ai/generate-notes', cache('5 minutes'));
```

#### 3. Database Connection Pooling
```javascript
// PostgreSQL connection pooling
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Security Hardening

#### 1. Environment Security
```bash
# Secure environment file
chmod 600 .env
chown root:root .env

# Use secrets management
aws secretsmanager create-secret --name edunexus-ai/openai-key --secret-string "your-api-key"
```

#### 2. Network Security
```bash
# Configure firewall
sudo ufw allow 3000
sudo ufw allow 22
sudo ufw enable

# Use HTTPS
sudo certbot --nginx -d yourdomain.com
```

#### 3. Application Security
```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

---

## 📚 Additional Resources

### Documentation
- [API Documentation](http://localhost:3000/api-docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Support
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/edunexus-ai/issues)
- **Discord Community**: [Join our community](https://discord.gg/edunexus-ai)
- **Email Support**: support@edunexus-ai.com

### Contributing
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Development Setup**: [DEVELOPMENT.md](DEVELOPMENT.md)

---

**🚀 Ready to deploy EduNexus AI? Follow this guide for a smooth, professional deployment experience!**
