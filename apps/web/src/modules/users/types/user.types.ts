export interface UserProfile {
  id: number;
  uuid: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface UserProfileResponse {
  data: UserProfile;
}
