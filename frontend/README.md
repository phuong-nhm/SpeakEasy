This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Làm tiếp trang [Tên Trang] theo đúng chuẩn: tách riêng Service/Hook/Table/Modal/Header, Table có cột STT, Form dùng state lẻ trong Hook không dùng payload. Nhớ nhắc mình gửi DTO/Service hoặc thông tin các trường input trước khi bắt đầu viết code.

Bước 1: Gửi Types & Mock Data
"Bắt đầu màn hình [Tên màn hình]. Đây là file Types/Interfaces và Mock Data (nếu có). Mày xem qua để nắm struct dữ liệu, chưa cần viết code gì cả, chỉ xác nhận đã hiểu data."

Bước 2: Gửi Custom Hook / Logic State
"Đây là file Hook / State Management. Mày đọc kỹ cách quản lý state, filter, và ép kiểu ID (String/Number). Xác nhận lại cho tao các state chính và logic xử lý trước khi sang bước tiếp theo."

Bước 3: Gửi các Sub-Component đã tách
"Tao gửi file Sub-Component [Tên Component]. Mày đọc kỹ props nhận vào từ Hook. Kiểm tra xem props có bám sát state ở Bước 2 chưa, có chỗ nào bị lệch type hay sai UI không thì chỉ ra."

Bước 4: Gửi Page chính (Tối ưu & Ráp nối)
"Đây là file Page chính. Mày hãy refactor lại file này sao cho gọn nhất có thể, bám sát 100% vào Hook ở Bước 2 và các Sub-Component ở Bước 3. Không tự tiện đẻ thêm logic hay service ngoài scope!"
