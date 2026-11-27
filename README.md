# marc.io.vn

Trang chủ của **https://marc.io.vn/** — truy cập nhanh các công cụ do AI Agent xây dựng:

| Công cụ | Địa chỉ |
|---|---|
| MintMath | https://mintmath.marc.io.vn/ |
| Document Tools | https://document-tools.marc.io.vn/ |

HTML/CSS/JS thuần, không có bước build. GitHub Actions chạy test Playwright (desktop + mobile) rồi deploy thư mục `src/` lên GitHub Pages.

## Thêm một công cụ mới

Sửa `src/js/apps.js`, chép thêm một khối:

```js
{
  name: 'Tên công cụ',
  url: 'https://ten-cong-cu.marc.io.vn/',
  description: 'Mô tả ngắn.',
  tags: ['Tag1', 'Tag2'],
},
```

Push lên `main` → Actions test và deploy. Thẻ trên trang và menu đều lấy từ danh sách này.

## Chạy trên máy

```bash
npm install
npm start      # http://localhost:5173
npm test       # Playwright E2E
```

## Thiết lập một lần

1. **GitHub Pages**: Settings → Pages → Source: **GitHub Actions**. Custom domain: `marc.io.vn`, bật **Enforce HTTPS** khi chứng chỉ sẵn sàng.
2. **DNS** cho tên miền gốc `marc.io.vn` (giữ nguyên các bản ghi CNAME của `mintmath`, `document-tools`):

   | Loại | Tên | Giá trị |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | papts0909.github.io |

   (Tuỳ chọn IPv6: AAAA `@` → `2606:50c0:8000::153`, `…8001::153`, `…8002::153`, `…8003::153`.)
