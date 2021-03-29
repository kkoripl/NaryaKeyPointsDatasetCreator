export class NumbersUtilsService {
  static scale(value: number, scale: number): number {
    return this.round(value * scale);
  }

  static backToOriginal(scaledValue: number, scale: number): number {
    return this.round(scaledValue / scale);
  }

  static round(value, scale= 0): number {
     const num = +(value + 'e+' + scale);
     return +(Math.round(num) + ('e-' + scale));
  }
}
