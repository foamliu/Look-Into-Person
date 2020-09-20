import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';
import { ImageSnippet } from 'src/app/shared/image-snippet.model';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  constructor(private imageService: ImageService, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {}
  @ViewChild('file') file: any;
  originalImage = new ImageSnippet();
  processedImage = new ImageSnippet();

  addFiles() {
    this.file.nativeElement.click();
  }

  async onFilesAdded() {
    const file: File = this.file.nativeElement.files[0];
    const reader = new FileReader();
    const loading = await this.loadingCtrl.create();

    loading.present();

    reader.addEventListener('load', (event: any) => this.uploadImage(event.target.result, file));

    reader.readAsDataURL(file);
  }

  uploadImage(uploadedImageSrc: string, uploadedFile: File) {
    const uploadedImage = new ImageSnippet();
    uploadedImage.updateFile(uploadedImageSrc, uploadedFile);

    this.imageService.uploadImage(uploadedFile).subscribe(
      (response: any) => this.readAndLoadUploadResponse(response, uploadedImage),
      () => this.handleError()
    );
  }

  async handleError() {
    const toast = await this.toastCtrl.create({
      message: 'Something went wrong trying to upload your image. Please try again',
      duration: 5000,
      position: 'top',
      color: 'warning'
    });

    toast.present();
    this.loadingCtrl.dismiss();
  }

  readAndLoadUploadResponse(image: Blob, originalImage: ImageSnippet) {
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      const processedImage = new ImageSnippet(event.target.result, <File>image);
      this.updateOriginalAndProcessedImages(originalImage, processedImage);
      this.loadingCtrl.dismiss();
    });

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  updateOriginalAndProcessedImages(originalImage: ImageSnippet, processedImage: ImageSnippet) {
    this.processedImage.updateFile(processedImage.getSrc(), processedImage.getFile());
    this.originalImage.updateFile(originalImage.getSrc(), originalImage.getFile());
  }

  clickImage(event: any) {
    const id = event.target.id;
    const img: any = document.getElementById(id);
    const canvas: any = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    const pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;
    console.log(pixelData);
  }
}
