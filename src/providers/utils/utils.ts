import {ElementRef} from "@angular/core";

export class Utils {
  static enumToMap(type: any, delimiter:string = " "): {key: string, value:string}[] {
    return Object.keys(type)
      .map((s,i) => {
        return {
          key: s,
          value: Object.values(type)[i],
          formatted: Utils.formatTitle(s, delimiter)
        }
      });
  }

  static formatTitle(string: string, delimiter: string = " ") {
    return string.replace(/_/g," ")
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
      .replace(/ /g,delimiter)
  }

  /**
   * Check if a component is visible
   * @param {ElementRef} elementRef the reference to the components element
   * @returns {any} true if the component is visible, false otherwise
   */
  static isVisible(elementRef: ElementRef) {
    return elementRef.nativeElement.offsetParent;
  }
}
