import { Component, OnInit } from '@angular/core';
import { FormHeaderComponent } from '../../components/molecules/form-header/form-header.component';
import { TIPOPERSONA } from '../../shared/interfaces/typo_persona';
import { VinculacionNaturalComponent } from '../../components/organisms/vinculacion-natural/vinculacion-natural.component';
import { ActivatedRoute } from '@angular/router';
import { VinculacionJuridicaComponent } from '../../components/organisms/vinculacion-juridica/vinculacion-juridica.component';
import { VendorService } from '../../services/vendor.service';
import { GlobalService } from '../../services/global.service';
import { AuthService } from '../../services/auth.service';
import { VENDORFORMSTATUS } from '../../shared/interfaces/typo_vendor_form_status';
import { DocumentationFormComponent } from '../../components/organisms/documentation-form/documentation-form.component';
import { catchError, map, of, switchMap } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { file_types } from '../../shared/interfaces/files_types';
import { ThanksComponent } from '../../components/organisms/thanks/thanks.component';

@Component({
  selector: 'app-forms-secuoya',
  standalone: true,
  imports: [
    FormHeaderComponent,
    VinculacionNaturalComponent,
    VinculacionJuridicaComponent,
    DocumentationFormComponent,
    ThanksComponent
  ],
  templateUrl: './forms-secuoya.component.html',
  styleUrl: './forms-secuoya.component.css'
})
export class FormsSecuoyaComponent implements OnInit {
  personEnnum = TIPOPERSONA;
  typePerson: number = TIPOPERSONA.Natural;
  title: string = '';
  loading: boolean = false;
  vendorId: any;
  vendorStatus: any;
  VENDORSTATUS = VENDORFORMSTATUS;
  linkDocument: any = null;

  lists: any = {
    documentTypes: [],
    economicActivities: [],
    vendorInfo: null
  };

  constructor(
    private vendorService: VendorService,
    private globalService: GlobalService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.vendorId = params.id;
      this.vendorService.setVendorId(params.id);
      this.loadData();
    })
  }

  loadData(loading: boolean = true) {
    if (loading) this.loading = true;

    this.vendorService.getVendorInfo().subscribe({
      next: (response: any) => {
        this.lists = {
          documentTypes: response.f_document_type_ids,
          economicActivities: response?.economic_activities,
          vendorInfo: response?.vendor_basic_info,
          riskLevels: response?.arl_risk_levels,
          bloodTypes: response?.blood_type || [],
        };
        this.typePerson = response.vendor_basic_info?.f_person_type_id;
        this.vendorStatus = response?.vendor_status
        this.vendorService.setDocumentsList(response.document_vendor);
        this.getTitle();
        this.loading = false;
      },
      error: (e: any) => {
        if (e.status == 401) this.auth.logOut(this.vendorId);
      }

    });
  }

  sendForm(ev: any) {
    if(this.loading) return;
    this.loading = true;
    const formData = this.globalService.setVinculationForm(ev.form);
    this.vendorService.updateVendor(formData).subscribe({
      next: () => {
        if (ev.nextForm) {
          this.vendorService.setNextVendorStatus().subscribe(() => {
            this.loadData();
          });
        } else {
          this.loading = false;
        }
        this.globalService.openSnackBar('Cambios guardados', '', 5000);

      },
      error: () => {
        this.globalService.openSnackBar('Fallo al guardar los datos', '', 5000);
      }
    });
  }

  submitFile(ev: any) {
    this.loading = true;
    const { value, formControlName } = ev;

    const fileIdDocument = Object.keys(file_types).find(
      (key) =>
      file_types[key as unknown as keyof typeof file_types] == formControlName
    );

    const documentId = this.globalService.getDocumentLink(fileIdDocument)?.document_id;
    if (!value) {
      this.vendorService.deleteVendorDocument({ document_id: documentId })
      .subscribe((data) => this.loading = false);
    }
    else {
      const nameFile = this.globalService.normalizeString(value.name);
      this.vendorService.getPresignedPutURL(nameFile, ev.vendor_id).pipe(
        catchError((error) =>
          of({ id: fileIdDocument, file: value, key: '', url: '' })
        ),
        map((putUrl: any) => ({
          ...putUrl,
          id: fileIdDocument,
          file: value,
        })),
        switchMap((uploadFile: any) => {
          if (!uploadFile.url) {
            return of({ blobFile: null, uploadFile });
          }
          return new Promise(resolve => {
            uploadFile.file.arrayBuffer().then((blobFile: File) => resolve({ blobFile, uploadFile }));
          });
        }),
        switchMap((blobUpdateFile: any) => {
          const { blobFile, uploadFile } = blobUpdateFile;
          if (!blobFile) {
            return of(uploadFile);
          }
          return this.vendorService.uploadFileUrlPresigned(<File>blobFile, uploadFile.url, uploadFile.file.type)
            .pipe(
              catchError((_) => of({ ...value, url: '' })),
              map((value) => value.type == HttpEventType.Response ? uploadFile : null)
            );
        }),
        switchMap(
          (uploadFile: any) => {
            if (!uploadFile) return of(false);
            return this.vendorService.updateVendorDocument({
              vendor_document_type_id: Number(uploadFile.id),
              link: uploadFile.url
              ? `${ev.vendor_id}/${nameFile}`
              : ``,
            });
          }
        ),
        map((response: any) => {
          this.linkDocument = response;
        })
      )
      .subscribe((value) => {
        setTimeout(() => { 
          this.loading = false;
        }, 3500)
      });
    }
  }

  getTitle() {
    switch (this.vendorStatus) {
      case VENDORFORMSTATUS.CREADO:
        switch (this.typePerson) {
          case TIPOPERSONA.Natural:
            this.title = 'VINCULACION / ACTUALIZACION DE DATOS PERSONA NATURAL';
            break;
          case TIPOPERSONA.Juridica:
            this.title = 'VINCULACION / ACTUALIZACION DE DATOS PERSONA JURIDICA';
            break;
          default:
            this.title = 'VINCULACION / ACTUALIZACION DE DATOS PERSONA NATURAL';
            break;
        }
        break;
      case VENDORFORMSTATUS.VINCULACION:
        switch (this.typePerson) {
          case TIPOPERSONA.Natural:
            this.title = 'CARGA DOCUMENTOS PERSONA NATURAL';
            break;
          case TIPOPERSONA.Juridica:
            this.title = 'CARGA DOCUMENTOS PERSONA JURIDICA';
            break;
          default:
            this.title = 'CARGA DOCUMENTOS';
            break;
        }
        break;
    }
  }
}
