import type { UserDto } from "$lib/api/user";

declare global {
	namespace App {
		interface PageData {
      user?: UserDto | null;
    }
	}
}

export {};
