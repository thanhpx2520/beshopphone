// import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs-extra';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

const saltRounds = 10;
const pump = promisify(pipeline);

// const hashPasswordHelper = (myPlaintextPassword: string) => {
//   return bcrypt.hash(myPlaintextPassword, saltRounds);
// };

// const comparePasswordHelper = (
//   myPlaintextPassword: string,
//   hashPassword: string,
// ) => {
//   return bcrypt.compare(myPlaintextPassword, hashPassword);
// };

const createFolderAndSaveFile = async (folder: string, file: any) => {
  const uploadDir = path.join(__dirname, '../..', `public/images/${folder}`);
  await fs.ensureDir(uploadDir); // Tạo thư mục nếu chưa có

  // Lấy phần đuôi mở rộng (ví dụ .jpg, .png)
  const ext = path.extname(file.filename);

  // Tạo tên file mới với uuid
  const newFilename = `${uuidv4()}${ext}`;

  const filePath = path.join(uploadDir, newFilename);
  await pump(file.file, fs.createWriteStream(filePath));

  return {
    ...file,
    filename: newFilename,
    originalname: file.filename,
  };
};

const deleteImageFile = async (folder: string, filename: string) => {
  const filePath = path.join(
    __dirname,
    '../..',
    `public/images/${folder}`,
    filename,
  );

  try {
    const exists = await fs.pathExists(filePath);
    if (exists) {
      await fs.remove(filePath);
      console.log(`Đã xóa ảnh: ${filePath}`);
    } else {
      console.warn(`Ảnh không tồn tại: ${filePath}`);
    }
  } catch (error) {
    console.error(`Lỗi khi xóa ảnh: ${error}`);
    throw new Error('Không thể xóa ảnh');
  }
};

export { createFolderAndSaveFile, deleteImageFile };
