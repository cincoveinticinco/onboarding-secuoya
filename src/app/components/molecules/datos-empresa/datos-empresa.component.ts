import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubtitleComponent } from '../../atoms/subtitle/subtitle.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';

@Component({
  selector: 'app-datos-empresa',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    SubtitleComponent,
    TextInputComponent,
  ],
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.css']
})
export class DatosEmpresaComponent {
  @Input() form: FormGroup | undefined;
  nitPattern = '^[0-9]{1,9}$';

  getControl(controlName: string): FormControl {
    return this.form?.get(controlName) as FormControl;
  }
}
