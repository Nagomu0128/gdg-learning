// 認証まわりの共有型(クライアント安全 — server モジュールを import しない)。
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};
