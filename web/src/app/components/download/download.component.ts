import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';
import { DownloadErrorMessage } from 'src/assets/constants';

interface DownloadOption {
  label: string;
  checked: boolean;
  name: string;
}

@Component({
  selector: 'download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DownloadComponent implements OnInit {
  @Input() serialID: string;
  numberChecked = 0;

  constructor(
    private imageService: ImageService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      options: this.formBuilder.array([])
    });
  }

  get formArr() {
    return this.form.get('options') as FormArray;
  }

  downloadOptions = [
    { label: 'Original Image', name: 'orig', checked: false },
    {
      label: 'Original Image with Outline',
      name: 'origOutline',
      checked: false
    },
    { label: 'Segmented Image', name: 'seg', checked: false },
    {
      label: 'Segmented Image with Outline',
      name: 'segOutline',
      checked: false
    }
  ] as DownloadOption[];

  form: FormGroup;
  formArray: FormArray = this.formBuilder.array([]);

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm(): void {
    this.downloadOptions.forEach((option: DownloadOption) => {
      const formGroup = this.formBuilder.group({});
      formGroup.addControl(option.name, this.formBuilder.control(false));
      this.formArr.push(formGroup);
    });
  }

  close(): void {
    this.modalCtrl.dismiss(false);
  }

  onCheckboxChange(event: any): void {
    if (event.detail.checked) {
      this.numberChecked++;
    } else {
      this.numberChecked--;
    }
  }

  download(): void {
    this.showLoading();
    const formData = new FormData();

    this.formArr.value.forEach((value) => {
      for (const option in value) {
        if (option) {
          formData.append(option, value[option]);
        }
      }
    });

    formData.append('serialID', this.serialID);
    this.imageService.downloadImages(formData).subscribe(
      (event: HttpEvent<any>) => this.handleDownloadResponse(event),
      () => this.imageService.handleError(DownloadErrorMessage)
    );
  }

  async showLoading(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: `Downloading... ${this.imageService.getDownloadProgress()}%`
    });

    await loading.present();
    this.imageService.setLoadingElement(document.querySelector('div.loading-wrapper div.loading-content'));
  }

  handleDownloadResponse(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.DownloadProgress: {
        this.imageService.setDownloadProgress(Math.round((event.loaded / event.total) * 100));
        break;
      }
      case HttpEventType.Response: {
        if (event && event.body) {
          const zip = new Blob([event.body], {
            type: 'application/zip'
          });

          this.promptForDownload(zip);
          this.modalCtrl.dismiss(true);
        } else {
          this.imageService.handleError(DownloadErrorMessage);
        }
        break;
      }
    }
  }

  promptForDownload(zip: Blob): void {
    const url = window.URL.createObjectURL(zip);
    window.open(url);
  }
}
