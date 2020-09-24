import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ColorPickerModule } from 'ngx-color-picker';
import { ImageService } from 'src/app/services/image/image.service';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [ColorPickerModule, CommonModule, FormsModule, IonicModule, HomePageRoutingModule, HttpClientModule],
  declarations: [HomePage],
  providers: [ImageService]
})
export class HomePageModule {}
