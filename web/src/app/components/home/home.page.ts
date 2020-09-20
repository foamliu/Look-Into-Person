import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';
import { ImageSnippet } from 'src/app/shared/image-snippet.model';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  constructor(private imageService: ImageService, private loadingCtrl: LoadingController) {}
  @ViewChild('file') file: any;
  uploadedFile = new ImageSnippet();
  processedImage = new ImageSnippet();
  fileAdded = false;

  addFiles() {
    this.file.nativeElement.click();
  }

  async onFilesAdded() {
    const file: File = this.file.nativeElement.files[0];
    const reader = new FileReader();
    const loading = await this.loadingCtrl.create();

    loading.present();

    reader.addEventListener('load', (event: any) => {
      this.uploadImage(event, file);
    });

    reader.readAsDataURL(file);
  }

  uploadImage(event: any, file: File) {
    this.uploadedFile.updateFile(event.target.result, file);

    this.imageService.uploadImage(this.uploadedFile.file).subscribe(
      (response) => {
        this.createImageFromBlob(response);
        this.loadingCtrl.dismiss();
        this.fileAdded = true;
      },
      (err) => {
        console.log('An error has occurred: ', err);
        // Do we need to set the processed image status to something else?
        this.loadingCtrl.dismiss();
      }
    );
  }

  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      this.processedImage.updateFile(event.target.result, <File>image);
    });

    if (image) {
      reader.readAsDataURL(image);
    }
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
