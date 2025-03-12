import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { FormsSecuoyaComponent } from './pages/forms-secuoya/forms-secuoya.component';
import { ThanksComponent } from './components/organisms/thanks/thanks.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: 'home/:id',
    component: HomeComponent
  },
  {
    path: 'complete-form/:id',
    canActivate: [authGuard],
    component: FormsSecuoyaComponent,
  },
  {
    path: 'thanks-docs/:id',
    canActivate: [authGuard],
    component: ThanksComponent,
    data: {
      type: 'docs'
    }
  },
  {
    path: '**',
    component: PageNotFoundComponent
  },
];
