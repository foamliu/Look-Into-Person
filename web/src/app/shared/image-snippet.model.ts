export enum UploadStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2
}

export class ImageSnippet {
  status = UploadStatus.NotStarted;
  src = '/assets/icon/favicon.png';
  file: File;

  updateFile(src: string, file: File) {
    this.src = src;
    this.file = file;
  }
}
