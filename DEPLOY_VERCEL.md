# Hướng Dẫn Deploy lên Vercel

Vercel là nền tảng rất tốt để deploy các ứng dụng Frontend như Ant Design Pro / UmiJS. Dưới đây là các bước để deploy:

## Cách 1: Deploy qua GitHub/GitLab (Khuyên dùng)

Đây là cách dễ nhất và hỗ trợ CI/CD (tự động deploy khi có code mới).

1.  **Push code lên GitHub/GitLab**: Đảm bảo source code của bạn đã được push lên một repository.
2.  **Đăng nhập Vercel**: Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub/GitLab của bạn.
3.  **Import Project**:
    - Bấm **"Add New..."** -> **"Project"**.
    - Tìm repository dự án của bạn và bấm **"Import"**.
4.  **Cấu hình Build (Framework Preset)**:
    - Vercel thường sẽ tự động nhận diện framework là **UmiJS** hoặc **Create React App**.
    - Nếu không tự nhận, hãy chọn **Other** và cấu hình như sau:
      - **Build Command**: `npm run build`
      - **Output Directory**: `dist`
      - **Install Command**: `npm install`
5.  **Environment Variables**: Nếu dự án cần biến môi trường, hãy thêm vào mục "Environment Variables".
6.  **Deploy**: Bấm nút **"Deploy"**.

## Cách 2: Deploy bằng Vercel CLI

Nếu bạn muốn deploy trực tiếp từ máy tính (không qua GitHub):

1.  **Cài đặt Vercel CLI**:
    ```bash
    npm i -g vercel
    ```
2.  **Đăng nhập**:
    ```bash
    vercel login
    ```
3.  **Deploy**:
    Tại thư mục gốc dự án, chạy lệnh:
    ```bash
    vercel
    ```
    Làm theo các hướng dẫn trên màn hình (chấp nhận các giá trị mặc định).
4.  **Deploy Production**:
    Khi muốn deploy bản chính thức:
    ```bash
    vercel --prod
    ```

## Lưu ý quan trọng

- **File vercel.json**: Mình đã tạo sẵn file `vercel.json` trong thư mục gốc. File này giúp Vercel hiểu đây là ứng dụng Single Page App (SPA) và điều hướng mọi request về `index.html` để tránh lỗi 404 khi f5 lại trang.
- **API Proxy**: Nếu bạn call API đến một server khác (ví dụ backend chạy local hoặc server riêng), Vercel sẽ không tự động proxy như khi chạy dev dưới local (`config/proxy.ts`). Bạn cần đảm bảo code gọi API trỏ đúng đến domain thật của Backend, hoặc cấu hình Rewrite trong `vercel.json` để proxy API.
