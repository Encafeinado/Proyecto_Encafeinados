import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';
import { MapNavbarComponent } from './map-navbar/map-navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MapComponent,
    MapNavbarComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule
  ]
})
export class MapModule { }
