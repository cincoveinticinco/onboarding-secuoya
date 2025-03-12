import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkbox-input',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.css']
})
export class CheckboxInputComponent {

  @Input() label: string | undefined;
  @Input() control: FormControl = new FormControl();
  @Input() controlName: string = '';
  @Input() description: string = '';
  @Input() form: FormGroup | undefined;

  getErrors(): string | null {
    const touched = this.control.touched;
    if (this.control.hasError('required') && touched) {
      return 'Este campo es requerido *';
    }
    return null;
  }

  setDescriptionControl(control: any, nameControl: string) {
    if(this.form) {
      if (control) {
        this.form.get(`${nameControl}_description`)?.setValidators(Validators.required);
        this.form.get(`${nameControl}_description`)?.updateValueAndValidity();
      }
      else {
        this.form.get(`${nameControl}_description`)?.removeValidators(Validators.required);
        this.form.get(`${nameControl}_description`)?.updateValueAndValidity();
      }
    }
  }
}
