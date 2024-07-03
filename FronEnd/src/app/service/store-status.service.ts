import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreStatusService {
  private storeActivated: boolean = false;

  isStoreActivated(): boolean {
    return this.storeActivated;
  }

  setStoreActivation(status: boolean) {
    this.storeActivated = status;
  }
}
