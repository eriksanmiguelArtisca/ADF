import { OnInit, Component, ViewEncapsulation, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MOMENT_DATE_FORMATS, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';


import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchWidget, SearchWidgetSettings, SearchQueryBuilderService } from '@alfresco/adf-content-services';
/* import { LiveErrorStateMatcher } from '@alfresco/adf-content-services/search/forms/live-error-state-matcher'; */


declare let moment: any;

const DEFAULT_FORMAT_DATE: string = 'DD/MM/YYYY';

@Component({
  selector: 'app-download-filters.component',
  templateUrl: './download-filters.component_contabilizacion.html',
  styleUrls: ['./download-filters.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS}
  ],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'adf-search-date-range' }
})
export class DownloadFiltersComponentContabilizacion implements SearchWidget, OnInit {
    from: FormControl;
    to: FormControl;

    form: FormGroup;
    /* matcher = LiveErrorStateMatcher; */

    id: string;
    settings?: SearchWidgetSettings;
    context?: SearchQueryBuilderService;
    maxDate: any;
    datePickerDateFormat = DEFAULT_FORMAT_DATE;

    private onDestroy$ = new Subject<boolean>();

  constructor(private dateAdapter: DateAdapter<Moment>,
    private userPreferencesService: UserPreferencesService) {
  }

  getFromValidationMessage(): string {
    return this.from.hasError('invalidOnChange') || this.hasParseError(this.from) ? 'SEARCH.FILTER.VALIDATION.INVALID-DATE' :
      this.from.hasError('matDatepickerMax') ? 'SEARCH.FILTER.VALIDATION.BEYOND-MAX-DATE' :
        this.from.hasError('required') ? 'SEARCH.FILTER.VALIDATION.REQUIRED-VALUE' :
          '';
  }

  getToValidationMessage(): string {
    return this.to.hasError('invalidOnChange') || this.hasParseError(this.to) ? 'SEARCH.FILTER.VALIDATION.INVALID-DATE' :
      this.to.hasError('matDatepickerMin') ? 'SEARCH.FILTER.VALIDATION.NO-DAYS' :
        this.to.hasError('matDatepickerMax') ? 'SEARCH.FILTER.VALIDATION.BEYOND-MAX-DATE' :
          this.to.hasError('required') ? 'SEARCH.FILTER.VALIDATION.REQUIRED-VALUE' :
            '';
  }

  ngOnInit() {
    if (this.settings) {
      this.datePickerDateFormat = this.settings.dateFormat || DEFAULT_FORMAT_DATE;
    }
    const theCustomDateAdapter = <MomentDateAdapter><any>this.dateAdapter;
    theCustomDateAdapter.overrideDisplayFormat = this.datePickerDateFormat;

    this.userPreferencesService
      .select(UserPreferenceValues.Locale)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(locale => this.setLocale(locale));

    const validators = Validators.compose([
      Validators.required
    ]);

    this.from = new FormControl('', validators);
    this.to = new FormControl('', validators);

    this.form = new FormGroup({
      from: this.from,
      to: this.to
    });

    this.maxDate = this.dateAdapter.today().startOf('day');
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  apply(model: { from: string, to: string }, isValid: boolean) {
    if (isValid && this.id && this.context && this.settings && this.settings.fields) {
      const start = moment(model.from).startOf('day').format();
      const end = moment(model.to).endOf('day').format();
      //this.settings.fields
      this.context.queryFragments[this.id] = "";
      for (let index = 0; index < this.settings.fields.length ; index++) {//this.settings.fields.length; index++) {
        const field =  this.settings.fields[index];
        if( this.context.queryFragments[this.id].length > 0 ){
          this.context.queryFragments[this.id] += ` OR `;
        }
        this.context.queryFragments[this.id] += `${field}:['${start}' TO '${end}']`;    
      }
      //this.context.queryFragments[this.id] = `${this.settings.field}:['${start}' TO '${end}']`;
      this.context.update();
    }
  }

  reset() {
    this.form.reset({
      from: '',
      to: ''
    });
    if (this.id && this.context) {
      this.context.queryFragments[this.id] = '';
      this.context.update();
    }
  }

  onChangedHandler(event: any, formControl: FormControl) {
    const inputValue = event.srcElement.value;

    const formatDate = this.dateAdapter.parse(inputValue, this.datePickerDateFormat);
    if (formatDate && formatDate.isValid()) {
      formControl.setValue(formatDate);
    } else if (formatDate) {
      formControl.setErrors({
        'invalidOnChange': true
      });
    } else {
      formControl.setErrors({
        'required': true
      });
    }
  }

  setLocale(locale) {
    this.dateAdapter.setLocale(locale);
    moment.locale(locale);
  }

  hasParseError(formControl) {
    return formControl.hasError('matDatepickerParse') && formControl.getError('matDatepickerParse').text;
  }

  forcePlaceholder(event: any) {
    event.srcElement.click();
  }

  /* id: string;
  settings: SearchWidgetSettings;
  context: SearchQueryBuilderService;

  startDate: Date;
  endDate: Date;

  ngOnInit() {
      if (this.settings) {
          //this.field = this.settings['fields'];
          this.startDate = this.settings['key2'];
      }
  }
  onUIChanged() {
    this.context.queryFragments[this.id] = `some query`;
    this.context.update();
  } */
}
/* @Component({
  selector: 'app-download-filters.component.ts',
  templateUrl: './download-filters.component.html',
  styleUrls: ['./download-filters.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS}
  ],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'adf-search-date-range' }
}) */

@Component({
  selector: 'app-download-filters.component_acreedor',
  templateUrl: './download-filters.component_acreedor.html',
  styleUrls: ['./download-filters.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'adf-search-text' }
})
export class DownloadFiltersComponentAcreedor_Referencia implements SearchWidget, OnInit {

  /** The content of the text box. */
  @Input()
  value = '';

  id: string;
  settings: SearchWidgetSettings;
  context: SearchQueryBuilderService;

  ngOnInit() {
      if (this.context && this.settings && this.settings.pattern) {
          const pattern = new RegExp(this.settings.pattern, 'g');
          const match = pattern.exec(this.context.queryFragments[this.id] || '');

          if (match && match.length > 1) {
              this.value = match[1];
          }
      }
  }

  reset() {
      this.value = '';
      this.updateQuery(null);
  }

  onChangedHandler(event) {
      this.value = event.target.value;
      let copy_value = event.target.value;
      if (copy_value && this.settings && this.settings.maxlength && this.settings.totalLength) {
        while( copy_value.length < this.settings.totalLength ){
          copy_value = '0'+ copy_value; 
        }
      }
      this.updateQuery(copy_value);
  }

  private updateQuery(value: string) {
      if (this.context && this.settings && this.settings.fields) {
        this.context.queryFragments[this.id] = "";
        for (let index = 0; index < this.settings.fields.length ; index++) {
          const field =  this.settings.fields[index];
          if( this.context.queryFragments[this.id].length > 0 ){
            this.context.queryFragments[this.id] += ` OR `;
          }
          this.context.queryFragments[this.id] += value ? `${field}:'${value}'` : '';   
        }
          this.context.update();
      }
  }

}


