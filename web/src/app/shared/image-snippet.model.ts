export class ImageSnippet {
  private src: string;

  constructor(src?: string) {
    this.src = src;
  }

  setSrc(src: string) {
    this.src = src;
  }

  getSrc(): string {
    return this.src;
  }
}
