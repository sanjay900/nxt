export class Utils {
  static enumToMap(type: any, delimiter:string = " "): {key: string, value:string}[] {
    return Object.keys(type)
      .map((s,i) => {
        return {
          key: s,
          value: Object.values(type)[i],
          formatted: s
            .replace(/_/g," ")
            .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
            .replace(/ /g,delimiter)
        }
      });
  }
}
