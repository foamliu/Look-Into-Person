export class ImageSnippet {
  src: string;
  file: File;

  updateFile(src: string, file: File) {
    this.src = src;
    this.file = file;
  }
}
