import { mock } from '../mock/mock';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private storageKey = 'session';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string, remember: boolean): boolean {
    if (!this.isBrowser) return false;

    const validEmail = mock.user.email;
    const validPass = mock.user.password;

    if (email === validEmail && password === validPass) {
      const sessionData = { email, remember, token: 'FAKE_TOKEN' };
      if (remember) {
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
      }
      return true;
    }
    return false;
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!(localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey));
  }

  getUser() {
    if (!this.isBrowser) return null;
    const data = localStorage.getItem(this.storageKey) || sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  getToken(): string | null {
    const user = this.getUser();
    return user ? user.token : null;
  }
}
