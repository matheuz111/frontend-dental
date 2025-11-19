// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms'; // Puedes dejarlo si otros componentes lo usan

import { AppRoutingModule } from './app-routing.module';
import { App } from './app';

// NO IMPORTES LoginComponent aquí

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [App]
})
export class AppModule { }