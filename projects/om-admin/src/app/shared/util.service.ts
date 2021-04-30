import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor() {}

  public updateQuantityProperties(item: any) {
    // const name = item.name.toLowerCase();
    // const rgx = /(?<size>\b\d+)(\s+)?(?<unit>(gram|gm|kg))/i;
    // const res = name.match(rgx);
    // const kgMetricGroups = res ? res.groups : null;
    // if (kgMetricGroups) {
    // const unit = kgMetricGroups.unit.toLowerCase();
    // item.metric = item.metric || unit;
    // item.unitSize = item.unitSize || parseInt(kgMetricGroups.size);

    if (item.metric == 'kg' && item.unitSize) {
      // item.unitSize *= 1000;
      let grammage = item.quantity * item.unitSize * 1000;
      // if (item.metric === 'kg') {
      //   grammage *= 1000;
      // }
      item.deliveryGrammage =
        item.deliveryGrammage == null ? grammage : item.deliveryGrammage;
    } else if (item.metric == 'gms' && item.unitSize) {
      let grammage = item.quantity * item.unitSize;
      item.deliveryGrammage =
        item.deliveryGrammage == null ? grammage : item.deliveryGrammage;
    } else {
      item.deliveryQuantity =
        item.deliveryQuantity == null ? item.quantity : item.deliveryQuantity;
    }
    return item;
  }
}
