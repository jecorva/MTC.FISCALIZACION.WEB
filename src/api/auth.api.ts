import { http } from './http';
import { routesList } from './routes-list';
export const authApi = {
    login: (username: string, password: string) => {
      return http.post(routesList.authenticate.login, { username, password });
    }
};
