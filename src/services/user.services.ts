import { CreateUserRequest, CreateUserResponse } from "../types/user";
import { get, post, put } from "@/hooks/apiUtils";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  password?: string;
}

export const userService = {
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse | undefined> {
    const result = await post<CreateUserResponse, CreateUserRequest>("/save-user", data);
    
    // Si result es undefined, fue error manejado globalmente (SERVER_DOWN/SESSION_EXPIRED)
    if (!result) {
      return undefined;
    }

    return result;
  },

  async getProfile() {
    const response = await get("/users/profile");
    return response;
  },

  async updateProfile(data: UserProfileData) {
    const response = await put("/users/profile", data);
    return response;
  },
};
