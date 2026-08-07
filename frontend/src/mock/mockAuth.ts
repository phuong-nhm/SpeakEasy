import { AuthResponse, User } from '@/types/auth';

const MOCK_ABP_USER: User = {
  id: 'c8e1a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b', // Guid
  userName: 'student@example.com',
  email: 'student@example.com',
  name: 'A',          // Name
  surname: 'Nguyễn Văn', // Surname
};

export const mockLoginApi = (email: string, pass: string): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'student@example.com' && pass === '123456') {
        resolve({
          user: MOCK_ABP_USER,
          accessToken: 'mock-jwt-token-from-abp-backend',
        });
      } else {
        reject(new Error('Email hoặc mật khẩu không chính xác! (Thử: student@example.com / 123456)'));
      }
    }, 1000);
  });
};

export const mockRegisterApi = (
  surname: string,
  name: string,
  email: string,
  pass: string
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'student@example.com') {
        reject(new Error('Email này đã được sử dụng! Vui lòng chọn email khác.'));
        return;
      }

      const newUser: User = {
        id: crypto.randomUUID(), // Guid
        userName: email,
        email,
        name,
        surname,
      };

      resolve({
        user: newUser,
        accessToken: 'mock-jwt-token-from-abp-backend-new-user',
      });
    }, 1000);
  });
};