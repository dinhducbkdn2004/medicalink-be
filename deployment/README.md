# MedicaLink Deployment

Thư mục này chứa các file Docker Compose được tách riêng cho từng service để dễ dàng quản lý và cập nhật độc lập.

## 📁 Cấu Trúc File

```
deployment/
├── docker-compose.yml              # File chính kết hợp tất cả services
├── docker-compose.infrastructure.yml  # Database, Redis, RabbitMQ, Nginx
├── docker-compose.gateway.yml      # API Gateway
├── docker-compose.accounts.yml     # Accounts Service
├── docker-compose.provider.yml     # Provider Directory Service
├── docker-compose.booking.yml      # Booking Service
├── docker-compose.content.yml      # Content Service
├── docker-compose.notification.yml # Notification Service
├── docker-compose.orchestrator.yml # Orchestrator Service
├── deploy.sh                       # Bash deployment script
└── README.md                       # File này
```

## 🚀 Cách Sử Dụng

### Sử Dụng Script (Khuyến nghị)

**Linux/macOS:**
```bash
# Cấp quyền thực thi
chmod +x deployment/deploy.sh

# Start tất cả services
./deployment/deploy.sh start all

# Start chỉ infrastructure
./deployment/deploy.sh start infrastructure

# Start một service cụ thể
./deployment/deploy.sh start accounts

# Stop tất cả
./deployment/deploy.sh stop all

# Restart một service
./deployment/deploy.sh restart gateway

# Xem logs
./deployment/deploy.sh logs all

# Build lại images
./deployment/deploy.sh build all

# Update service (build + restart)
./deployment/deploy.sh update accounts

# Kiểm tra status
./deployment/deploy.sh status all
```

### Sử Dụng Docker Compose Trực Tiếp

**Start tất cả services:**
```bash
docker compose -f deployment/docker-compose.yml up -d
```

**Start chỉ infrastructure:**
```bash
docker compose -f deployment/docker-compose.infrastructure.yml up -d
```

**Start một service cụ thể:**
```bash
docker compose -f deployment/docker-compose.accounts.yml up -d
```

**Stop services:**
```bash
docker compose -f deployment/docker-compose.yml down
```

## 🔄 Quy Trình Deployment

### 1. Deployment Lần Đầu

```bash
# 1. Start infrastructure trước
./deployment/deploy.sh start infrastructure

# 2. Đợi infrastructure sẵn sàng (30 giây)
sleep 30

# 3. Start tất cả application services
./deployment/deploy.sh start all

# 4. Chạy migrations
docker exec medicalink-accounts sh -c "cd apps/accounts-service && npx prisma migrate deploy"
docker exec medicalink-provider sh -c "cd apps/provider-directory-service && npx prisma migrate deploy"
docker exec medicalink-booking sh -c "cd apps/booking-service && npx prisma migrate deploy"
docker exec medicalink-content sh -c "cd apps/content-service && npx prisma migrate deploy"
docker exec medicalink-notification sh -c "cd apps/notification-service && npx prisma migrate deploy"
```

### 2. Update Một Service Cụ Thể

```bash
# Update chỉ accounts service
./deployment/deploy.sh update accounts

# Hoặc manual:
git pull
pnpm install && pnpm run build
docker compose -f deployment/docker-compose.accounts.yml build --no-cache
docker compose -f deployment/docker-compose.accounts.yml up -d --force-recreate
```

### 3. Rolling Update (Zero Downtime)

```bash
# Update từng service một cách tuần tự
for service in accounts provider booking content notification orchestrator gateway; do
  echo "Updating $service..."
  ./deployment/deploy.sh update $service
  sleep 10
done
```

### 4. Rollback

```bash
# Rollback code
git reset --hard <previous-commit>
pnpm install && pnpm run build

# Rebuild và restart service
./deployment/deploy.sh update accounts
```

## 🔧 Troubleshooting

### Service Không Start

```bash
# Kiểm tra logs
./deployment/deploy.sh logs accounts

# Kiểm tra status
./deployment/deploy.sh status all

# Restart service
./deployment/deploy.sh restart accounts
```

### Database Connection Issues

```bash
# Kiểm tra infrastructure
./deployment/deploy.sh status infrastructure

# Restart infrastructure
./deployment/deploy.sh restart infrastructure
```

### Network Issues

```bash
# Tạo lại network
docker network rm medicalink-network
docker network create medicalink-network

# Restart infrastructure
./deployment/deploy.sh restart infrastructure
```

## 📊 Monitoring

### Xem Logs Real-time

```bash
# Tất cả services
./deployment/deploy.sh logs all

# Service cụ thể
./deployment/deploy.sh logs accounts
```

### Kiểm Tra Resource Usage

```bash
# Docker stats
docker stats

# Service status
./deployment/deploy.sh status all
```

## 🔐 Security Notes

- Tất cả application services không expose ports ra ngoài (chỉ infrastructure)
- Chỉ API Gateway và Nginx expose ports 3000, 80, 443
- Database chỉ accessible từ internal network
- RabbitMQ management interface không expose trong production

## 🎯 Lợi Ích Của Cấu Trúc Mới

1. **Modularity**: Mỗi service có file riêng, dễ quản lý
2. **Independent Updates**: Có thể update từng service độc lập
3. **Easier Debugging**: Logs và troubleshooting từng service riêng biệt
4. **Scalability**: Dễ dàng scale từng service theo nhu cầu
5. **Development**: Dev có thể chạy chỉ services cần thiết
6. **CI/CD**: Dễ tích hợp với pipeline deployment tự động