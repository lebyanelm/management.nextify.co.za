import { StorageChangeEvent } from '../interfaces/StorageChangeEvent';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  change: Subject<StorageChangeEvent<any>> = new Subject<StorageChangeEvent<any>>();

  constructor() { }

  public setItem(name: string, data: any, isJSON = true): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isJSON) {
          data = JSON.stringify(data);
      }

      localStorage.setItem(name, data);
      this.change.next({name, data: isJSON ? JSON.parse(data) : data});
      resolve({name, data});
    });
  }

  public getItem(name: string, isJSON = true): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem(name);
      resolve(isJSON ? JSON.parse(data) : data);
    });
  }

  public remove(name: string): Promise<void> {
    localStorage.removeItem(name);
    return new Promise((resolve, reject) => {
      resolve();
      this.change.next({name, data: null});
    });
  }
}
