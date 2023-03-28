import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { TranslocoLocalizeRouterModule } from 'transloco-localize-router';


import { FooterComponent } from './footer/footer.component';
import { icons } from './layout.icons';

const EXPORTED_DECLARATIONS = [ FooterComponent];

@NgModule({
  declarations: [...EXPORTED_DECLARATIONS],
  imports: [CommonModule, FormsModule, RouterModule, TranslocoLocalizeRouterModule, SvgIconsModule.forChild(icons)],
  exports: [...EXPORTED_DECLARATIONS],
})
export class LayoutModule {}
