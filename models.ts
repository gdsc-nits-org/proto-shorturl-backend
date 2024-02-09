// models.ts
interface User {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
  }
  
  interface Token {
    id: string;
    userId: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
  }
  