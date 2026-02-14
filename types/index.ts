export type ShareLink = {
  id: number;
  slug: string;
  topic: string;
  owner_email: string;
  created_at: string;
};

export type LocationEvent = {
  id: number;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  client_ip: string | null;
  user_agent: string | null;
  created_at: string;
};
