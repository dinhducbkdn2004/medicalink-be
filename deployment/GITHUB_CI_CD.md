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

Workflow `cd-docker.yml` sau khi push image sẽ gọi `scripts/deploy-ai-to-vm.sh` — cần đủ ba secret `VM_*` và repo đã clone đúng path trên server (mục 4).

---

## 3. Tự động cập nhật server khi **push code**

### Backend (microservice)

- Workflow **`deploy-staging.yml`** chạy khi **push vào nhánh `staging`** (và `workflow_dispatch`).
- Tag image: `staging-<full-commit-sha>`, khớp với `deploy-to-vm.sh`.
- **`main` / `master` không** kích hoạt deploy tự động bằng workflow này. Muốn auto-deploy production trên `main`, thêm nhánh `main` vào `on.push.branches` trong `deploy-staging.yml` (hoặc tạo `deploy-production.yml` riêng, tag image khác).

- Job **`detect-changes`**: nếu commit **không đụng** `apps/<service>`, `libs/`, `deployment/`… thì có thể **không build/deploy service nào** (đúng thiết kế).

### AI service

- **`cd-docker.yml`**: push **`staging`**, **`main`**, **`master`** → build + push GHCR → job **`deploy-vm`** SSH lên VM, `docker pull` và `compose` lại (script `scripts/deploy-ai-to-vm.sh`).
- **`workflow_dispatch`**: build + push + **deploy VM** (giống cuối luồng push); có thể truyền `image_tag` tùy chỉnh.

---

## 4. Chuẩn bị trên **server** (bắt buộc để CI/CD chạy được)

### 4.1 Repo và thư mục (khớp script)

| Repo | Đường dẫn trên VM |
|------|-------------------|
| microservice | `/home/<VM_USER>/medicalink-microservice` |
| AI | `/home/<VM_USER>/medicalink-ai-service` |

`deploy-to-vm.sh` và `deploy-ai-to-vm.sh` giả định đúng hai path trên. User SSH phải trùng `VM_USER`.

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
- [ ] VM: hai repo đúng path + `.env.production` / `.env`.
- [ ] GitHub microservice: secrets `VM_*` + push vào **`staging`** để auto deploy backend (theo thay đổi file).
- [ ] GitHub AI: secrets `VM_*` + push **`staging`/`main`/`master`** để build + (mặc định) deploy AI.
- [ ] GHCR: image pull được từ VM (public package hoặc token đủ quyền).

Chi tiết image: `ghcr.io/<owner>/medicalink-<service>:…` và `ghcr.io/<owner>/medicalink-ai:<tag>`.
