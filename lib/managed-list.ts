export type ManagedList = {
  id: number;
  playlistName: string | null;
  playlistType: string | null;
  m3uUrl: string | null;
  epgUrl: string | null;
  username: string;
  password: string;
  createdAt: string;
};

export type ManageError =
  | "credentials"
  | "captcha"
  | "session"
  | "name"
  | "url"
  | "epg"
  | "server"
  | "username"
  | "password"
  | "code"
  | "missing"
  | "save"
  | "config";
