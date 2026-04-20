import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '_gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
  },
];
