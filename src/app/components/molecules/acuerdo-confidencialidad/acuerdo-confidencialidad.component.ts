import { Component, Input } from '@angular/core';
import { SubtitleComponent } from '../../atoms/subtitle/subtitle.component';
import { TextInputComponent } from '../../atoms/text-input/text-input.component';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-acuerdo-confidencialidad',
  standalone: true,
  imports: [
    SubtitleComponent,
    TextInputComponent,
    DatePipe
  ],
  templateUrl: './acuerdo-confidencialidad.component.html',
  styleUrl: './acuerdo-confidencialidad.component.css'
})
export class AcuerdoConfidencialidadComponent {
  @Input() form: FormGroup | undefined;
  @Input() lists:any;

  date = new Date();
  

  getControl(controlName: string): FormControl {
    return this.form?.get(controlName) as FormControl;
  }
}
