export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  avatar_url: string | null;
  auth_provider: 'credentials' | 'google';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  is_admin: boolean | null;
}

export interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      verification_codes: {
        Row: VerificationCode;
        Insert: Omit<VerificationCode, 'id' | 'created_at'>;
        Update: Partial<Omit<VerificationCode, 'id' | 'created_at'>>;
      };
    };
  };
}