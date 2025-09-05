# EduLearn API Gateway

A robust, scalable API Gateway built with Node.js, TypeScript, and Express.js for the EduLearn microservices platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Rate Limiting**: Redis-based rate limiting with configurable limits
- **Security**: Helmet.js security headers, CORS protection, input validation
- **Observability**: OpenTelemetry tracing, Prometheus metrics, structured logging
- **gRPC Integration**: Microservices communication via gRPC
- **File Upload**: Support for Cloudinary and AWS S3
- **Message Queue**: Kafka integration for event-driven architecture
- **Health Checks**: Comprehensive health and liveness probes
- **Docker Support**: Multi-stage Docker builds with security best practices

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Redis
- Docker & Docker Compose (for containerized deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Redis** (if not using Docker)
   ```bash
   redis-server
   ```

## 🚀 Development

### Start development server
```bash
npm run dev
```

### Build for production
```bash
npm run build:prod
```

### Run tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Code quality
```bash
# Lint
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Security audit
npm run security-check
```

## 🐳 Docker

### Build image
```bash
docker build -t edulearn-api-gateway .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | - |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

### Rate Limiting

Configure rate limiting in your environment:
```bash
RATE_LIMIT_POINTS=100    # Requests per window
RATE_LIMIT_DURATION=60   # Window in seconds
```

## 📊 Monitoring & Observability

### Health Checks
- **Health**: `GET /health` - Comprehensive health check
- **Liveness**: `GET /live` - Simple liveness probe

### Metrics
- **Prometheus**: `GET /metrics` - Application metrics

### Tracing
- **Jaeger**: Distributed tracing with OpenTelemetry

## 🔒 Security

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security

### Authentication
- JWT-based authentication
- Role-based authorization
- Token refresh mechanism

### Rate Limiting
- IP-based rate limiting
- User-based rate limiting
- Configurable limits and windows

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Mobile App    │    │   Third Party   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     API Gateway           │
                    │  (Authentication,         │
                    │   Rate Limiting,          │
                    │   Routing)                │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   User Service    │  │  Course Service   │  │ Notification      │
│   (gRPC)          │  │  (gRPC)           │  │ Service (gRPC)    │
└───────────────────┘  └───────────────────┘  └───────────────────┘
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Course Management
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id` - Get course details

## 🧪 Testing

### Test Structure
```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Docker Swarm
```bash
docker stack deploy -c docker-compose.yml edulearn
```

### Environment-Specific Configs
- `docker-compose.dev.yml` - Development
- `docker-compose.prod.yml` - Production
- `docker-compose.test.yml` - Testing

## 📈 Performance

### Optimization Tips
1. **Caching**: Use Redis for session and data caching
2. **Connection Pooling**: Configure database connection pools
3. **Compression**: Enable gzip compression
4. **Load Balancing**: Use multiple instances behind a load balancer

### Monitoring
- **CPU Usage**: Monitor with Prometheus
- **Memory Usage**: Track heap and RSS
- **Response Times**: APM with Jaeger
- **Error Rates**: Alert on high error rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for public APIs

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Basic authentication and authorization
- Rate limiting
- Health checks
- Docker support 
