export class ImageSnippet {
  private src: string;
  private file: File;

  constructor(src?: string, file?: File) {
    this.src = src;
    this.file = file;
  }

  updateFile(src: string, file: File) {
    this.src = src;
    this.file = file;
  }

  setSrc(src: string) {
    this.src = src;
  }

  getSrc(): string {
    return this.src;
  }

  setFile(file: File) {
    this.file = file;
  }

  getFile(): File {
    return this.file;
  }
}
