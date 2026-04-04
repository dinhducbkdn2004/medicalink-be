# GitHub Actions — CI/CD: secrets, env server, tự động deploy

## 1. Secrets trên GitHub (repo **medicalink-microservice**)

| Secret | Bắt buộc? | Ghi chú |
|--------|-----------|---------|
| `VM_HOST` | Có (nếu dùng deploy lên VM) | IP hoặc hostname SSH |
| `VM_USER` | Có | User Linux trên VM (vd. `ubuntu`, `deploy`) |
| `VM_SSH_KEY` | Có | **Toàn bộ** private key PEM (nội dung file `id_rsa` / key tạo cho GitHub Actions), gồm `-----BEGIN ... KEY-----` … **Không** đặt passphrase hoặc dùng `ssh-agent` trong CI |
| `GITHUB_TOKEN` | Không cần khai báo | GitHub tự inject; workflow dùng để push/pull **GHCR trong cùng org/user**. |

**Không cần** thêm secret khác cho luồng hiện tại nếu:

- Image GHCR **public**, hoặc
- Image **private** nhưng `GITHUB_TOKEN` của workflow vẫn `docker login` + `pull` được (thường ổn với `permissions.packages: write` đã có trên job build).

Nếu `docker pull` trên VM báo **401 / denied**:

1. Trên GitHub: **Settings → Actions → General → Workflow permissions** → chọn cho phép workflow ghi packages (nếu chưa).
2. Hoặc tạo **PAT** (Classic) với quyền `read:packages` (và `write:packages` nếu build ngoài Actions), thêm secret ví dụ `GHCR_READ_TOKEN`, rồi sửa `deploy-to-vm.sh` / workflow để truyền PAT thay cho `GITHUB_TOKEN` khi login trên VM (chỉnh theo nhu cầu bảo mật).

---

## 2. Secrets repo **medicalink-ai-service**

Giống bảng trên: `VM_HOST`, `VM_USER`, `VM_SSH_KEY`. `GITHUB_TOKEN` tự có.

Workflow **`.github/workflows/cd-docker.yml`** (trong repo **medicalink-ai-service**): build image → push **`ghcr.io/<owner>/medicalink-ai:<tag>`** → SSH chạy **`scripts/deploy-from-ghcr.sh`** (kéo compose **`compose.ghcr.yaml`** trên VM). Cần clone repo AI tại `/home/<VM_USER>/medicalink-ai-service` và file **`.env`** production.

---

## 3. Tự động cập nhật server khi **push code**

### Backend (microservice)

- **`deploy-staging.yml`**: push **nhánh `staging`** (và `workflow_dispatch`). Image: `staging-<sha>`.
- **`deploy-production.yml`**: push **`main`** hoặc **`master`** (và `workflow_dispatch`). Image: `production-<sha>`. Job deploy dùng **environment** `production` (có thể bật approval / protection trong GitHub Settings → Environments).
- **`detect-changes`**: commit chỉ sửa doc / workflow có thể **không** build service nào — lần đầu hoặc rollout đủ dịch vụ: **Manual Deploy All** với *Force rebuild*, hoặc workflow_dispatch với *force rebuild all*.

- Trên VM, **`deploy-to-vm.sh`** (khi `VM_GIT_PULL=true`, mặc định từ Actions) chạy **`git pull`** trong `medicalink-microservice` trước khi `docker pull`, để `deployment/*.yml` và `nginx` khớp repo — **không** thay thế việc kéo image từ GHCR.

### AI service (repo riêng)

- **`cd-docker.yml`**: push **`staging`**, **`main`**, **`master`** → build + push GHCR → **`deploy-vm`** SSH + `compose.ghcr.yaml`. Tag: `staging-<sha>` hoặc `production-<sha>` (nhánh main/master).
- **`workflow_dispatch`**: có thể tắt deploy VM (`deploy_to_vm: false`) hoặc truyền `image_tag_override`.

### Seed quyền (RBAC) — không chạy mặc định

- **`seed-permissions-vm.yml`**: chỉ `workflow_dispatch`, nhập `CONFIRM` — SSH chạy `permission-seeds` trong container **medicalink-accounts** (image accounts đã có `tsx` + script).
- Trong **deploy** (staging / production / manual): bật input **run permission seed** chỉ khi cần; luồng push tự động **không** seed.
- Seed demo toàn DB (`pnpm seed` / `scripts/seed.ts`) **không** nằm trong CI — chỉ chạy tay khi chính sách cho phép.

---

## 4. Chuẩn bị trên **server** (bắt buộc để CI/CD chạy được)

### 4.1 Repo và thư mục (khớp script)

| Repo | Đường dẫn trên VM |
|------|-------------------|
| microservice | `/home/<VM_USER>/medicalink-microservice` |
| AI | `/home/<VM_USER>/medicalink-ai-service` |

`deploy-to-vm.sh` và **`medicalink-ai-service/scripts/deploy-from-ghcr.sh`** giả định đúng hai path trên. User SSH phải trùng `VM_USER`. Trên VM nên **`git checkout`** đúng nhánh (vd. production VM → `main`, staging → `staging`) để `git pull` trong CI khớp kỳ vọng.

Trên VM:

```bash
sudo mkdir -p /home/$USER/medicalink-microservice /home/$USER/medicalink-ai-service
# clone 2 repo vào đúng tên thư mục; copy deployment compose + nginx + .env.production
docker network create medicalink-network   # nếu chưa có (xem DEPLOYMENT_PRODUCTION_VI.md)
```

### 4.2 File môi trường — **không** nằm trong GitHub Secrets cho runtime app

- **`medicalink-microservice/.env.production`** (trên server, cạnh compose): copy từ **`.env.production.example`** trong repo rồi điền secret — `DEPLOYMENT_PRODUCTION_VI.md`.
- **`medicalink-ai-service/.env`** trên server: copy từ **`.env.production.example`** (cùng repo AI), đặt tên `.env` nếu `compose.integrated.yaml` dùng `env_file: .env`.

GitHub Actions **không** thay thế hai file này khi deploy — chỉ đổi **image** container. Khi đổi biến môi trường, sửa `.env` trên VM và `docker compose up -d` (hoặc redeploy).

### 4.3 Docker trên VM

User `VM_USER` nằm trong nhóm `docker` (hoặc dùng root — không khuyến nghị):

```bash
sudo usermod -aG docker $USER
```

### 4.4 Logging driver (VPS)

Nếu compose dùng `gcplogs` và không có GCP, container sẽ không chạy — đổi sang `json-file` (xem `DEPLOYMENT_PRODUCTION_VI.md`).

---

## 5. Env trong **repo** (dev / CI, không phải server)

- **microservice CI** (`ci-reusable.yml`): không cần `.env` cho Prisma generate + build; không kết nối DB thật trong CI hiện tại.
- **AI CI**: không cần API key để `compileall` / `docker build`; worker thật vẫn dùng `.env` trên server.

---

## 6. Checklist nhanh

- [ ] VM: Docker + mạng `medicalink-network` + stack đã từng `up` thủ công ít nhất một lần.
- [ ] VM: hai repo đúng path + `.env.production` / `.env` (AI dùng `compose.ghcr.yaml` sau CI).
- [ ] GitHub **microservice**: secrets `VM_*` + push **`staging`** hoặc **`main`/`master`** (production) để auto deploy theo `detect-changes`.
- [ ] GitHub **medicalink-ai-service**: secrets `VM_*` + workflow **`cd-docker.yml`** khi push **`staging`/`main`/`master`**.
- [ ] GitHub **Environments**: tuỳ chọn bật protection cho `production` (backend + AI).
- [ ] GHCR: image pull được từ VM.

Image: `ghcr.io/<owner>/medicalink-<service>:staging-<sha>|production-<sha>` và `ghcr.io/<owner>/medicalink-ai:…`.
