import { BadRequestException } from '@nestjs/common';

export const validateFile = (file: any) => {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // ❌ Kiểm tra kích thước file (VD: 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.file.bytesRead > maxSize) {
    throw new BadRequestException('File quá lớn! Kích thước tối đa là 5MB');
  }

  // ❌ Kiểm tra loại file (chỉ cho phép ảnh)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException('Chỉ cho phép file ảnh JPG, PNG, GIF');
  }

  // ❌ Kiểm tra tên file có rỗng không
  if (!file.filename || file.filename.trim() === '') {
    throw new BadRequestException('Tên file không hợp lệ');
  }
};
