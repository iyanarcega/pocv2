import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { TranslocoLocalizeRouterModule } from 'transloco-localize-router';
import { environment } from '@environments/environment';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'characters',
    pathMatch: 'full',
  },
  {
    path: 'characters',
    loadChildren: () => import('./features/characters/characters.module').then((m) => m.CharactersModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
    }),
    TranslocoLocalizeRouterModule.forRoot({
      noPrefixLang: environment.defaultLanguage,
      hrefLangs: true,
      hrefLangsBaseUrl: environment.url,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
