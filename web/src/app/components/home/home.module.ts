import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ColorPickerModule } from 'ngx-color-picker';
import { ImageService } from 'src/app/services/image/image.service';
import { DownloadComponent } from '../download/download.component';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [ColorPickerModule, CommonModule, FormsModule, IonicModule, HomePageRoutingModule, HttpClientModule, ReactiveFormsModule],
  declarations: [HomePage, DownloadComponent],
  providers: [ImageService]
})
export class HomePageModule {}
