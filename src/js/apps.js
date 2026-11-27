// Danh sách công cụ hiển thị trên marc.io.vn.
// Thêm một trang mới: chép một khối { ... } bên dưới, sửa nội dung rồi push lên main.
// GitHub Actions sẽ test và deploy tự động.
export const APPS = [
  {
    name: 'MintMath',
    url: 'https://mintmath.marc.io.vn/',
    description:
      'Viết bài giải toán theo từng dòng, gõ bằng bàn phím là chính. Xuất ra .tex, PDF hoặc PNG, lưu lên Backblaze B2 để mở ở máy khác.',
    tags: ['Toán', 'LaTeX', 'PWA'],
  },
  {
    name: 'Document Tools',
    url: 'https://document-tools.marc.io.vn/',
    description:
      'Bộ công cụ cho lập trình viên chạy ngay trên trình duyệt: so sánh văn bản, kiểm tra / định dạng / so sánh JSON, Base64. Dùng được offline.',
    tags: ['JSON', 'Diff', 'Offline'],
  },
];
