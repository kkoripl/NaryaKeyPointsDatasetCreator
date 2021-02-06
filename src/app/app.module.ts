import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatTableModule} from '@angular/material/table';
import {MatSelectModule} from '@angular/material/select';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {FilterSelectedPipe} from './pipes/filter-selected.pipe';
import {MatInputModule} from '@angular/material/input';
import {ToastrModule} from 'ngx-toastr';
import {MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
  declarations: [
    AppComponent,
    FilterSelectedPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTableModule,
    MatSelectModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    ToastrModule.forRoot(),
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
