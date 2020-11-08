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
  @Input() private serialID: string;
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
      () => {
        /* TODOs
         * Update download progress via events
         * Prompt the user to download the zip when it comes back
         * Only then should we dismiss the modal!
         */
        this.modalCtrl.dismiss(true);
      },
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
}
