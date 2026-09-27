export let apiVersion = "1.14.2";
export const notices: string[] = [];
export class Notice {
  constructor(message: string) {
    notices.push(message);
  }
}
export function changeVersion(version: string): void {
  apiVersion = version;
}
