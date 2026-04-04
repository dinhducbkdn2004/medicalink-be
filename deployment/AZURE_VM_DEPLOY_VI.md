# Triển khai lên Azure VM (Ubuntu 24.04) — ví dụ `medicalink-prod-01`

Tài liệu cho VM: user **`azureuser`**, SSH key `.pem`, public IP (đặt trong GitHub secret `VM_HOST`).

> Repo đã đổi Docker logging từ `gcplogs` → **`json-file`** để chạy được trên Azure mà không cần GCP.

---

## 1. Azure — mở cổng (NSG)

Trong **Network security group** gắn với NIC của VM, thêm inbound:

| Cổng | Mục đích |
|------|----------|
| **22** | SSH |
| **80** | HTTP (Nginx) |
| **443** | HTTPS (Nginx) |

Tạm thời có thể mở **3000** để test trực tiếp API Gateway (nên tắt sau khi Nginx ổn).

**Không** nên public **5432, 5672, 6379** ra Internet.

---

## 2. GitHub Actions — secrets

Trong repo **medicalink-microservice** (và **medicalink-ai-service** nếu deploy AI qua CI):

| Secret | Giá trị ví dụ |
|--------|----------------|
| `VM_HOST` | `74.226.217.46` (hoặc DNS) |
| `VM_USER` | `azureuser` |
| `VM_SSH_KEY` | Toàn bộ nội dung file `medicalink-prod-01_key.pem` |

**Actions → General → Workflow permissions:** cho phép workflow ghi **packages** (GHCR).

---

## 3. Cài Docker trên VM (lần đầu)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker azureuser
```

Đăng xuất SSH vào lại (hoặc `newgrp docker`) để nhóm `docker` có hiệu lực.

---

## 4. Mạng Docker + clone repo

```bash
docker network create medicalink-network

cd ~
git clone https://github.com/<ORG_OR_USER>/medicalink-microservice.git
git clone https://github.com/<ORG_OR_USER>/medicalink-ai-service.git
```

Thay URL bằng repo thật của bạn (private repo: dùng PAT hoặc deploy key).

---

## 5. Biến môi trường backend

1. **`~/medicalink-microservice/.env.production`** — copy từ máy dev (đã điền secret).  
   Hostname trong file: `postgres`, `redis`, `rabbitmq`, …

2. **Biến cho Compose hạ tầng** (Postgres + Rabbit user mặc định trong container): tạo  
   **`~/medicalink-microservice/deployment/.env`** (Compose tự đọc khi chạy trong thư mục `deployment/`):

```env
POSTGRES_PASSWORD=__CÙNG_MẬT_KHẨU_TRONG_DATABASE_URL__
RABBITMQ_USER=admin
RABBITMQ_PASS=__CÙNG_MẬT_KHẨU_TRONG_RABBITMQ_URL__
```

`POSTGRES_PASSWORD` trong bước này phải trùng mật khẩu user `medicalink` trong URL `ACCOUNTS_DATABASE_URL` (script `init-db.sh` gán user `medicalink` với mật khẩu này).

---

## 6. SSL cho Nginx (bắt buộc trước khi bật container Nginx)

`nginx/nginx.conf` trỏ tới `ssl/cert.pem` và `ssl/key.pem`.

**Tạm thở (self-signed) để test:**

```bash
cd ~/medicalink-microservice
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem \
  -subj "/CN=api.medicalink.online"
```

Production: thay bằng Let’s Encrypt hoặc chứng chỉ Cloudflare Origin, rồi sửa `server_name` nếu domain khác.

---

## 7. Chạy hạ tầng (chưa cần Nginx nếu chưa có cert)

Có cert rồi thì bật full infra kèm Nginx:

```bash
cd ~/medicalink-microservice/deployment
docker compose -f docker-compose.infrastructure.yml up -d
```

**Nếu chưa có cert**, chỉ bật DB / queue / Qdrant:

```bash
docker compose -f docker-compose.infrastructure.yml up -d postgres redis rabbitmq qdrant
```

Sau khi có file cert trong `nginx/ssl`:

```bash
docker compose -f docker-compose.infrastructure.yml up -d nginx
```

---

## 8. Database (Prisma)

Trên máy có Node/pnpm **hoặc** dùng container tạm, chạy migrate với `DATABASE_URL` trỏ tới VM (mở NSG tạm tới 5432 **chỉ từ IP của bạn**), **hoặc** `docker exec` vào container `medicalink-postgres` không cần public DB — cách sạch nhất: vào VM, cài tạm `pnpm`/`node` hoặc chạy migrate từ container app sau khi đã có image.

Ví dụ sau khi `accounts-service` đã chạy trên VM:

```bash
docker exec -it medicalink-accounts sh -c "cd apps/accounts-service && npx prisma migrate deploy"
```

Lặp tương tự các service có Prisma (booking, content, notification, provider). Script `deploy-to-vm.sh` đã cố gắng chạy migrate khi deploy từng service có DB.

---

## 9. Đưa microservice lên bằng CI/CD (khuyến nghị)

1. **Staging:** push nhánh **`staging`** → `deploy-staging.yml`. **Production:** push **`main`** / **`master`** → `deploy-production.yml` (image tag `production-<sha>`).

2. **Hoặc** Actions → **Manual Deploy All** / **Manual Deploy Service** → bật **Force rebuild** khi cần rollout đủ dịch vụ.

3. Pipeline: build → GHCR → SSH `deploy-to-vm.sh` (trước đó **`git pull`** trên VM nếu `VM_GIT_PULL=true`). Thư mục server: **`/home/<VM_USER>/medicalink-microservice`** (khớp secret `VM_USER`).

4. Lần đầu hoặc commit không đụng `apps/*`, có thể cần **Manual Deploy All** + **Force rebuild**.

5. **RBAC seed:** không chạy tự động khi push. Cần thì: Actions → **Seed permissions on VM** (gõ `CONFIRM`), hoặc deploy manual với *run permission seed*, hoặc `docker exec medicalink-accounts tsx apps/accounts-service/scripts/permission-seeds.ts` (image accounts mới).

---

## 10. Chạy AI worker

1. **`~/medicalink-ai-service/.env`** — production (`RABBITMQ_URL`, `QDRANT_URL`, `API_GATEWAY_BASE_URL=http://api-gateway:3000`, `OPENAI_API_KEY`, …).

2. **Sau CI (khuyến nghị):** trong repo **medicalink-ai-service**, push **`staging`** / **`main`** / **`master`** để workflow **`cd-docker.yml`** build image → GHCR → SSH chạy **`compose.ghcr.yaml`** (cần secrets `VM_*` trên repo AI).

3. **Build tại chỗ trên VM** (không qua GHCR):

```bash
cd ~/medicalink-ai-service
docker compose -f compose.integrated.yaml up -d --build
```

4. Lần đầu nạp vector (nếu cần) — thay file compose đúng với cách bạn chạy (`integrated` hoặc `ghcr`):

```bash
docker compose -f compose.integrated.yaml run --rm medicalink-ai medicalink-ai-sync
# hoặc: compose -f compose.ghcr.yaml run --rm medicalink-ai medicalink-ai-sync
```

---

## 11. Kiểm tra

```bash
docker ps
curl -sS http://127.0.0.1:3000/api/health
```

Từ máy bạn: `https://<domain-của-bạn>/api/health` (qua Nginx) hoặc `http://74.226.217.46:3000` nếu vẫn mở cổng 3000.

---

## 12. Lưu ý tài nguyên

VM **D2s v3 (2 vCPU, 8 GB)** chạy full stack khá căng. Theo dõi `docker stats`; cân nhắc tăng tier hoặc bỏ giới hạn `mem_limit` ở một số service nếu OOM.

Azure **auto-shutdown** (02:00) — nếu cần API 24/7 thì tắt hoặc lên lịch phù hợp.
