# Layers v0.2

> 潮牌周边平台 — 创作者入驻 → 作品审核 → 周边定制 → 店铺展示，全流程开源实现。

**线上地址：** https://layershop.store
**管理后台：** https://layershop.store/admin
**管理员账号：** `admin@layers.local` / `layers2026admin`

---

## 产品需求文档（PRD）

### 1. Concept & Vision

Layers 是一个连接**原创设计师**与**潮牌消费者**的平台。创作者上传原创图案，经过平台审核后，可定制 T 恤、卫衣、版画、手机壳等周边商品上线销售。平台不备货、不发货，只做创意和生产的桥梁。

核心差异化：完全围绕**创作者生态**设计，强调作品审核、风格标签、创作者主页，而非单纯商品货架。

---

### 2. 用户角色

| 角色 | 描述 |
|------|------|
| **游客** | 浏览店铺、创作者主页、申请入驻 |
| **创作者** | 上传作品、查看审核状态、管理周边、查看收益 |
| **管理员** | 审核入驻申请、审核作品、管理所有创作者和周边 |

---

### 3. 核心功能

#### 3.1 入驻流程
1. 游客填写「成为供应商」表单（姓名、邮箱、微信、作品集链接、艺术风格）
2. 提交后状态为 `pending`，管理员收到申请通知
3. 管理员审核：拒绝（附理由）或批准
4. 批准时系统生成 **10 位临时密码**，发送到创作者邮箱
5. 创作者用临时密码登录，首次登录强制修改密码

#### 3.2 作品上传与审核
1. 创作者登录后上传作品图（支持 JPG/PNG，最大 5MB）
2. 作品进入 `pending` 状态，等待管理员审核
3. 管理员在 `/admin/artworks` 页面查看所有待审作品
4. **通过**：选择该作品要生成的周边类型（T恤/卫衣/版画/手机壳/马克杯/帆布袋/贴纸/毯子）
5. **拒绝**：填写拒绝理由，创作者会看到
6. 通过后系统创建该作品对应的**第一个周边产品**（待完善状态）

#### 3.3 周边管理
1. 管理员为每个周边上传 Mockup 图片（最多 6 张）
2. 填写购买链接（如淘宝/独立站链接）
3. 设置价格（可选）
4. 所有信息完整后，状态改为 `approved`，自动出现在店铺
5. 支持一个作品生成**多种周边类型**，每种独立管理
6. 创作者可在 `/dashboard/products` 查看自己的所有周边状态

#### 3.4 店铺展示
- `/shop` — 展示所有 `approved` 状态的周边商品
- 支持分类筛选（T恤/卫衣/版画/手机壳/马克杯/帆布袋/贴纸/毯子）
- 点击商品图或标题跳转外部购买链接（不在站内闭环）
- `/creator/[id]` — 创作者公开主页，展示该创作者所有 approved 周边

---

### 4. 数据模型

#### artworks.jsonl（作品/审核对象）
```json
{"id":"aw_xxx","creatorId":"c_xxx","creatorName":"创作者名","title":"作品标题","titleEn":"Title EN","artworkUrl":"/uploads/...","status":"pending|approved|rejected","rejectionReason":"","category":"illustration|digital|photography","createdAt":"..."}
```

#### products.jsonl（周边商品）
```json
{"id":"pr_xxx","artworkId":"aw_xxx","creatorId":"c_xxx","creatorName":"","title":"周边名","titleEn":"","artworkUrl":"/uploads/...","mockups":["url1","url2"],"purchaseUrl":"https://...","status":"pending|approved|rejected","category":"tshirt|hoodie|canvas|phonecase|mug|tote|sticker|blanket","price":"","createdAt":"..."}
```

#### creators.jsonl（创作者账户）
```json
{"id":"c_xxx","email":"...","name":"...","passwordHash":"sha256hash","status":"active|suspended|rejected","wechat":"","portfolio":"","art_style":"","created_at":"..."}
```

#### applications.jsonl（入驻申请）
```json
{"id":"app_xxx","name":"...","email":"...","wechat":"...","portfolio":"...","art_style":"...","status":"pending|approved|rejected","rejectionReason":"","created_at":"..."}
```

---

### 5. 技术架构

| 层次 | 技术选型 |
|------|---------|
| 前端框架 | Next.js 16 (App Router) |
| 类型安全 | TypeScript（严格模式） |
| 样式 | Tailwind CSS |
| 数据存储 | JSONL 文件（无数据库依赖） |
| 部署模式 | Next.js Standalone（PM2 管理） |
| Web 服务器 | Nginx + Let's Encrypt HTTPS |
| 进程管理 | PM2（开机自启） |
| 服务器 | 阿里云 ECS 2GB RAM / Ubuntu |
| 邮件 | nodemailer（QQ 邮箱 SMTP） |

#### 目录结构
```
app/
  admin/          管理后台页面
  api/            所有 API 路由
  dashboard/      创作者后台页面
  shop/           店铺页面
  creator/[id]/   创作者公开主页
  login/          统一登录页
  become-a-vendor/  入驻申请页
components/       React 组件（按功能域划分）
lib/              API 客户端、i18n、工具函数
data/             JSONL 数据文件
public/images/mockups/  Mockup 素材图
```

#### API 路由一览
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 创作者注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/auth/me | 当前用户信息 |
| GET/POST | /api/artworks | 作品列表/上传 |
| PATCH | /api/artworks?id= | 更新作品状态 |
| GET | /api/products | 店铺商品（只显示 approved） |
| GET | /api/creators | 创作者列表 |
| GET | /api/creators/products?id= | 某创作者的 approved 商品 |
| GET/PATCH/POST | /api/dashboard/products | 创作者周边管理 |
| GET/PATCH | /api/admin/creators | 管理员-创作者管理 |
| GET | /api/admin/applications | 管理员-入驻申请列表 |
| GET/PATCH | /api/admin/manage/products | 管理员-周边审核 |
| POST | /api/admin/manage/products/mockup | 上传 mockup 图片 |

---

### 6. 部署信息

| 项目 | 值 |
|------|---|
| 服务器公网 IP | 39.106.162.16 |
| SSH | `ssh -i /tmp/alicloud.pem root@39.106.162.16` |
| Nginx 配置 | `/etc/nginx/sites-available/layers-next` |
| PM2 服务名 | `layers-next` |
| 数据目录 | `/var/www/layers-next/data/` |
| 构建产物 | `/var/www/layers-next/.next/standalone/` |
| HTTPS 证书 | Let's Encrypt (`certbot`) |

#### 常用命令
```bash
# 重启服务
pm2 restart layers-next

# 查看日志
pm2 logs layers-next

# 查看状态
pm2 status

# Nginx 重载配置
nginx -s reload

# 证书续期（自动 cron）
certbot renew
```

---

### 7. 开发

```bash
# 本地开发
npm install
npm run dev     # http://localhost:3000

# 构建（需先开启 standalone）
# 编辑 next.config.ts: output: 'standalone'
npm run build

# TypeScript 类型检查
npx tsc --noEmit
```

---

### 8. 已知限制与待办

- [ ] 邮件发送依赖 QQ 邮箱 SMTP，生产环境建议切换 SendGrid/Resend
- [ ] 没有订单/支付系统，商品链接跳转到外部（淘宝/独立站）
- [ ] 没有 CDN/对象存储，文件上传到 `public/uploads/`（服务器本地）
- [ ] 没有深色模式
- [ ] 没有移动端 App
- [ ] /dashboard/settings 页面为空（待实现）
- [ ] 创作者主页 `/creator/[id]` 暂无作品时显示空白

---

## LICENSE

MIT
