import { BaseService } from '@/core/services/BaseService';
import {
  WatchItemFactory,
  WatchlistItem,
  WatchlistItems
} from '@/services/WatchItemFactory';

export class WatchlistService extends BaseService {
  private items: WatchlistItems[];
  private path: string;

  constructor() {
    super();
    this.items = [];
    this.path = '/api';
  }

  load(): Promise<WatchlistItems[]> {
    return new Promise((resolve, reject) => {
      if (this.items.length) {
        resolve(this.items);
      } else {
        this.$http
          .get(`${this.path}/list`)
          .then(response => {
            this.items = response.data.map((item: WatchlistItem) =>
              WatchItemFactory.create(item)
            );
            resolve(this.items);
          })
          .catch(error => reject(error));
      }
    });
  }
}

export default new WatchlistService();
