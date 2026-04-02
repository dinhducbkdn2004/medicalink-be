# Hướng dẫn deploy backend (medicalink-microservice) + AI worker (medicalink-ai-service) lên server thật

Tài liệu này mô tả **luồng triển khai thực tế** dựa trên cấu trúc repo hiện tại: Docker Compose trong `deployment/`, hạ tầng gồm Postgres, Redis, RabbitMQ, **Qdrant**, Nginx; API Gateway gọi Python worker qua **RabbitMQ** queue `ai_service_queue`.

---

## 1. Kiến trúc tóm tắt

```mermaid
flowchart LR
  subgraph internet[Mạng ngoài]
    FE[Frontend / Client]
  end
  subgraph server[Server / VPS]
    Nginx[Nginx :80/:443]
    GW[api-gateway :3000]
    subgraph ms[Microservices NestJS]
      ACC[accounts]
      PROV[provider]
      BOOK[booking]
      CONT[content]
      NOTIF[notification]
      ORCH[orchestrator]
    end
    RMQ[RabbitMQ]
    PG[(Postgres)]
    RD[(Redis)]
    QD[(Qdrant)]
    AI[medicalink-ai worker]
  end
  FE --> Nginx --> GW
  GW --> ms
  GW --> RMQ
  ms --> RMQ
  ms --> PG
  ms --> RD
  GW -- RPC recommend / suggest-specialties --> RMQ
  RMQ --> AI
  AI --> QD
  PROV -. doctor events .-> RMQ
  RMQ -. topic medicalink.topic .-> AI
```

- **Backend:** REST qua Nginx → `api-gateway`; các service nói chuyện với nhau và với DB/Redis/RabbitMQ qua **mạng Docker** `medicalink-network`.
- **AI service:** Process độc lập (Python), **không** mở port HTTP phục vụ user; chỉ **consume** `ai_service_queue` và **subscribe** exchange `medicalink.topic` (sự kiện đồng bộ hồ sơ bác sĩ). Cần truy cập **Qdrant** và (để đồng bộ batch lần đầu) **URL nội bộ của API Gateway**.

---

## 2. Yêu cầu server

| Thành phần | Gợi ý tối thiểu |
|------------|------------------|
| OS | Ubuntu 22.04 LTS (hoặc tương đương) |
| CPU/RAM | 4 vCPU / 8 GB RAM (AI + rerank + model nhẹ; tăng nếu nhiều request) |
| Disk | SSD, đủ cho Postgres + volume Qdrant + image Docker |
| Phần mềm | Docker Engine 24+, Docker Compose V2, Git |
| Build tùy chọn | Node 20+, pnpm (nếu build image trên CI rồi chỉ pull trên server thì có thể không cần) |

Mở firewall: **22** (SSH), **80/443** (HTTP/HTTPS). Không bắt buộc public **3000** nếu chỉ truy cập qua Nginx.

---

## 3. Chuẩn bị mạng Docker (bắt buộc với `deployment/*`)

Trong `deployment/docker-compose.infrastructure.yml` (và các file service khác), mạng được khai báo:

```yaml
networks:
  medicalink-network:
    external: true
```

**Trước lần `docker compose` đầu tiên**, tạo mạng thủ công:

```bash
docker network create medicalink-network
```

Nếu đặt tên khác, phải sửa **tất cả** compose production cho khớp (và file `compose.integrated.yaml` của AI service phải trỏ đúng `name:`).

---

## 4. Cấu hình biến môi trường backend

1. Clone repo `medicalink-microservice` lên server (hoặc máy build image).
2. Ở **thư mục gốc monorepo**, tạo `.env.production` (không commit git). Tham chiếu `.env.example` và chỉnh cho môi trường container:

### 4.1. Bắt buộc chỉnh khi chạy full Docker

| Biến | Trong container nên trỏ tới |
|------|-----------------------------|
| `ACCOUNTS_DATABASE_URL`, `BOOKING_DATABASE_URL`, … | Host **`postgres`**, port `5432`, user/password khớp volume Postgres (xem `init-db.sh` / tài liệu nội bộ) |
| `RABBITMQ_URL` | `amqp://USER:PASS@rabbitmq:5672` (USER/PASS khớp `RABBITMQ_USER` / `RABBITMQ_PASS` trong compose infrastructure) |
| `REDIS_HOST` | `redis` |
| `REDIS_PORT` | `6379` (trong compose infrastructure Redis **không** publish port ra host; service khác dùng hostname `redis`) |

**Lưu ý:** `.env.example` còn ví dụ `REDIS_PORT=15796` phù hợp dev local; trên production Docker dùng **`6379`** và host **`redis`**.

### 4.2. Gateway và AI

- Gateway đọc `RABBITMQ_URL` và đăng ký client `AI_SERVICE` tới queue **`ai_service_queue`** (xem `libs/rabbitmq` và `microservice-clients.module.ts`). Không đổi queue trừ khi đồng bộ cả worker Python (`AI_RPC_QUEUE` trong `medicalink_ai/config.py`).

### 4.3. JWT, SMTP, Cloudinary, Google GenAI

Điền đầy đủ secret production; `GOOGLE_GENAI_*` trùng cấu hình nếu bạn dùng Gemini ở microservice (AI worker có thể dùng riêng `LLM_PROVIDER=gemini` + key trong `.env` của AI repo).

---

## 5. Triển khai hạ tầng + dịch vụ backend

### 5.1. Logging driver (quan trọng trên VPS)

Các file `deployment/docker-compose*.yml` hiện dùng:

```yaml
logging:
  driver: gcplogs
```

Trên **VPS không có Google Cloud Logging**, `docker compose up` có thể **lỗi**. CÁCH XỬ LÝ (chọn một):

- Xóa hoặc comment toàn bộ khối `logging:` trong từng service; hoặc
- Đổi sang `driver: json-file`.

Giữ nguyên chỉ khi bạn chủ động deploy lên GCP với credential phù hợp.

### 5.2. SSL / Nginx

`deployment/docker-compose.infrastructure.yml` mount:

- `../nginx/nginx.conf`
- `../nginx/ssl`

Trước khi chạy production, chuẩn bị chứng chỉ (Let’s Encrypt hoặc file cert riêng) và cấu hình `proxy_pass` tới `api-gateway:3000` theo domain thật.

### 5.3. Khởi động stack

Từ thư mục `medicalink-microservice/deployment/`:

```bash
docker compose -f docker-compose.infrastructure.yml up -d
```

Đợi Postgres / RabbitMQ / Redis / Qdrant healthy. Sau đó (khi đã có image build hoặc build tại chỗ):

```bash
docker compose -f docker-compose.yml up -d --build
```

File `docker-compose.yml` chính **include** infrastructure + gateway + accounts + provider + booking + content + notification + orchestrator.

### 5.4. Migration & seed cơ sở dữ liệu

Database chỉ có schema sau khi chạy Prisma. Thực tế thường:

1. Vào container hoặc máy có `DATABASE_URL` trỏ tới Postgres production (tunnel hoặc cùng network).
2. Trên source monorepo (cùng version với image đang chạy):

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:push   # hoặc migrate deploy theo quy trình dự án
```

3. Seed / tạo super admin theo `development/guide.md` (scripts `accounts-service`), tùy chính sách production.

**Phải hoàn tất** trước khi kỳ vọng API hoạt động đầy đủ.

---

## 6. Triển khai medicalink-ai-service

Repo tách biệt: clone `medicalink-ai-service` cùng server (hoặc build image ở CI và push registry).

### 6.1. Điều kiện

- Container **AI** join **cùng** mạng `medicalink-network`.
- **RabbitMQ**, **Qdrant**, **API Gateway** đã chạy trong mạng đó.

### 6.2. File môi trường

Copy `.env.example` → `.env` và chỉnh cho production **full Docker** (tương tự `.env.docker.example`):

| Biến | Giá trị điển hình (stack trong deployment/) |
|------|-----------------------------------------------|
| `RABBITMQ_URL` | `amqp://admin:YOUR_PASS@rabbitmq:5672/` |
| `QDRANT_URL` | `http://qdrant:6333` |
| `QDRANT_API_KEY` | Để trống nếu Qdrant nội bộ không bật key |
| `OPENAI_API_KEY` | Bắt buộc (embedding) |
| `API_GATEWAY_BASE_URL` | `http://api-gateway:3000` (gateway là service tên `api-gateway` trong compose) |
| `LLM_PROVIDER` | `openai` hoặc `gemini` (+ key Gemini nếu cần) |

Queue mặc định: `ai_service_queue`, exchange topic: `medicalink.topic` — **khớp** với NestJS và worker Python.

### 6.3. Compose tích hợp

File `medicalink-ai-service/compose.integrated.yaml`:

- Service `medicalink-ai` **external network** `medicalink-network`.
- Volume cache + `./data` cho eval log (tùy chọn).

Trên server:

```bash
cd medicalink-ai-service
docker compose -f compose.integrated.yaml up -d --build
```

### 6.4. Nạp vector lần đầu (batch sync)

Worker sự kiện chỉ cập nhật khi có `doctor.profile.*`; **lần đầu** cần đồng bộ toàn bộ public doctors từ gateway:

```bash
docker compose -f compose.integrated.yaml run --rm medicalink-ai medicalink-ai-sync
```

Yêu cầu: `API_GATEWAY_BASE_URL` reachable từ container (endpoint `GET /api/doctors/profile/public`), và OpenAI + Qdrant hoạt động.

Sau thay đổi collection / hybrid schema, có thể cần ingest lại; xem log worker về hybrid vs legacy.

### 6.5. Kiểm tra nhanh AI

- Gọi từ ngoài vào (qua Nginx): `POST /api/ai/recommend-doctor`, `POST /api/ai/suggest-specialties`.
- Log container `medicalink-ai`: lỗi thường gặp — sai `RABBITMQ_URL`, sai pattern (worker cũ), thiếu API key OpenAI/Gemini, Qdrant không kết nối được.

---

## 7. Thứ tự khuyến nghị (checklist)

1. `docker network create medicalink-network` (nếu chưa có).
2. Chuẩn bị `.env.production` + chỉnh **logging** nếu không dùng GCP.
3. SSL + `nginx.conf` trỏ đúng `api-gateway`.
4. `docker compose` infrastructure → kiểm tra health.
5. `docker compose` full backend → kiểm tra gateway.
6. Prisma migrate/push + seed cần thiết.
7. Clone AI repo, `.env` với hostname `rabbitmq`, `qdrant`, `api-gateway`.
8. `compose.integrated.yaml up -d --build`.
9. Chạy `medicalink-ai-sync` một lần.
10. Kiểm tra API AI và tạo appointment end-to-end.

---

## 8. Nâng cấp & rollback

- **Backend:** build image tag mới, `docker compose pull` / rebuild, `up -d`, theo dõi migration Prisma bắt buộc đi kèm release.
- **AI:** rebuild image worker, `up -d --build`; pattern RPC trong `worker.py` phải khớp `libs/contracts` (ví dụ `ai.specialty-suggestion.request`). Luôn restart worker sau khi đổi code pattern.

---

## 9. Qdrant Cloud (tùy chọn)

Nếu không chạy Qdrant trong `deployment`:

- Thêm dịch vụ tối thiểu hoặc bỏ service `qdrant` khỏi compose (chỉ khi bạn biết rõ ảnh hưởng backup).
- Set `QDRANT_URL` + `QDRANT_API_KEY` trên **cả** worker AI (và đảm bảo gateway/events vẫn hoạt động bình thường).

---

## 10. Tham chiếu nhanh file trong repo

| Repo | File / thư mục | Ý nghĩa |
|------|----------------|--------|
| microservice | `deployment/docker-compose.yml` | Orchestrate toàn bộ |
| microservice | `deployment/docker-compose.infrastructure.yml` | Postgres, Redis, RabbitMQ, Qdrant, Nginx |
| microservice | `deployment/docker-compose.gateway.yml` | API Gateway |
| microservice | `libs/rabbitmq/src/rabbitmq-patterns.ts` | `AI_SERVICE_QUEUE` |
| microservice | `apps/api-gateway/src/clients/microservice-clients.module.ts` | Client `AI_SERVICE` |
| ai-service | `compose.integrated.yaml` | Worker join `medicalink-network` |
| ai-service | `Dockerfile` | Image worker |
| ai-service | `.env.example`, `.env.docker.example` | Biến môi trường |
| ai-service | `README.md` | Chi tiết RAG, hybrid, batch sync |

---

## CI/CD (GitHub Actions)

Pipeline build kiểm tra (lint, test, build Nest), deploy staging/manual, và image AI trên GHCR: xem **`deployment/GITHUB_CI_CD.md`**.

*Tài liệu phản ánh cấu trúc repo tại thời điểm viết. Khi đổi tên service, queue, hoặc network trong Compose, cập nhật tương ứng `.env` và compose AI.*
