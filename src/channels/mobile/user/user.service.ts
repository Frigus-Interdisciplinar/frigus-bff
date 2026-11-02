import { authService, profileService, userService } from "../../../services/index.js";

// agregador de servicos de usuario para o canal mobile
export class MobileUserService {
  readonly auth = authService;
  readonly profile = profileService;
  readonly admin = userService;
}

export const mobileUserService = new MobileUserService();
