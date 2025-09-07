import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }
  /**
   * Guarda un item en localStorage con manejo de errores
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isBrowser) return false;

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error guardando en localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Obtiene un item de localStorage con manejo de errores y valor por defecto
   */
  getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error leyendo de localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Elimina un item del localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isBrowser) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error eliminando de localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Verifica si localStorage está disponible
   */
  isAvailable(): boolean {
    if (!this.isBrowser) return false;

    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el uso actual del localStorage en bytes (aproximado)
   */
  getStorageUsage(): number {
    if (!this.isBrowser) return 0;

    let total = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const item = localStorage.getItem(key);
          if (item) {
            total += key.length + item.length;
          }
        }
      }
    } catch (error) {
      console.error('Error calculando uso del localStorage:', error);
    }
    return total;
  }

  /**
   * Limpia items expirados basados en un timestamp
   */
  cleanExpiredItems(prefix: string, maxAge: number): void {
    if (!this.isBrowser) return;

    const now = Date.now();
    const keysToRemove: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (parsed.ts && now - parsed.ts > maxAge) {
                keysToRemove.push(key);
              }
            } catch {
              // Si no se puede parsear, no es un item con timestamp
              continue;
            }
          }
        }
      }

      keysToRemove.forEach((key) => this.removeItem(key));
    } catch (error) {
      console.error('Error limpiando items expirados:', error);
    }
  }

  /**
   * Obtiene todas las claves que coinciden con un prefijo
   */
  getKeysByPrefix(prefix: string): string[] {
    if (!this.isBrowser) return [];

    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error('Error obteniendo claves por prefijo:', error);
    }
    return keys;
  }

  /**
   * Limpia completamente el localStorage
   */
  clear(): boolean {
    if (!this.isBrowser) return false;

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }
}
