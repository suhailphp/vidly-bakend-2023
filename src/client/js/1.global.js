/* eslint-disable no-undef */
/* eslint-disable no-script-url */
//const i18n = require('i18n');

const defaultDateFormat = 'D MMM YYYY';
const defaultShortDateFormat = 'D-MM-YY';
const defaultDateTimeFormat = 'D MMM YYYY, h:mm A';
const defaultTimeFormat = 'h:mm A';
const organizationTypeColors = [
  '#181C32', // indi
  '#50CD89', // main dep
  '#7239EA', // dep
  '#009ef7', // section
  '#FFC700', // branch
  '#F1416C', // unit
  '#fefefe']; // fallback
const operationLevelColors = [
  '#50CD89',
  '#009ef7', // '#7239EA',
  '#fe9700', '#F1416C', '#FF9F00', '#00A0FF', '#00FF00', '#FF0000', '#0000FF', '#000000'];
toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: true,
  progressBar: true,
  positionClass: 'toastr-top-right',
  preventDuplicates: true,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
};
const PSA = {
  __: (textKey, values = {}) => {
    let trText = __(textKey);
    for (const key of Object.keys(values)) {
      trText = trText.replace(`{{${key}}}`, values[key]);
    }
    return trText;
  },
  defaults: {
    /**
     * Data table default configs
     * @param url
     */
    datatable: (options) => ({
      responsive: true,
      //   dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>> <'row'<'col-sm-12'tr>> <'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      // dom:
      //   'f<\'table-responsive\'tr>'
      //   + '<\'row\''
      //   + '<\'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start\'li>'
      //   + '<\'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end\'p>'
      //   + '>',
      // lengthChange: false,
      autoWidth: false,
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      // deferRender: true,
      // scrollY: 800,
      // scrollCollapse: true,
      // scroller: true,
      searchHighlight: true,
      stateSave: false,
      stateDuration: 60 * 60, // one hour
      processing: true,
      serverSide: true,
      //   mark: true,
      ajax: {
        url: options && options.url ? options.url : window.location.href,
        data(d) {
          if (d.order) {
            const col = d.columns[d.order[0].column];
            // eslint-disable-next-line no-param-reassign
            d.order[0].column = col.data === 'function' ? col.name : col.data;
          }
          // remove cols from url query
          // eslint-disable-next-line no-param-reassign
          delete d.columns;
        },
      },
      // aaSorting: [[0, 'DESC']],
      language: {
        url: getLang() === 'ar' ? '/assets/json/datatable.ar.json' : '',
      },
      drawCallback(settings) {
        PSA.tooltip.init(document.getElementsByClassName('tbl-tp'));
        KTMenu.createInstances();
        // console.log(settings.oPreviousSearch.sSearch);
        try {
          $(`#${settings.sTableId}`).unhighlight();
          $(`#${settings.sTableId}`).highlight(settings.oPreviousSearch.sSearch);
        } catch (e) {
          // empty
        }
      },
    }),
    validate: {
      errorElement: 'span',
      errorPlacement(error, element) {
        error.addClass('invalid-feedback');
      },
      highlight(element, errorClass, validClass) {
        if ($(element).parent().find('span.select2-selection').length) {
          $(element)
            .parent()
            .find('span.select2-selection')
            .addClass('is-invalid');
        } else $(element).addClass('is-invalid');
      },
      unhighlight(element, errorClass, validClass) {
        if ($(element).parent().find('span.select2-selection').length) {
          $(element)
            .parent()
            .find('span.select2-selection')
            .removeClass('is-invalid');
        } else $(element).removeClass('is-invalid');
      },
    },
    tinymce: {
      height: '480',
      toolbar: ['undo redo | cut copy paste | bold italic | link | alignleft aligncenter alignright alignjustify ltr rtl',
        'bullist numlist | outdent indent | blockquote subscript superscript | advlist | autolink | lists charmap | print preview'],
      plugins: 'advlist autolink link lists charmap print preview directionality',
      hidden_input: true,
      directionality: getDir(),
      language: getLang(),
    },
  },
  /**
   * Form validation default configs
   */
  toast: {
    success: (body, title = __('Success')) => {
      toastr.success(body, title);
    },
    info: (body, title = __('Info')) => {
      toastr.info(body, title);
    },
    warning: (body, title = __('Warning')) => {
      toastr.warning(body, title);
    },
    error: (body, title = __('Error')) => {
      toastr.error(body, title);
    },
    clear: () => {
      toastr.clear();
    },
  },
  modal: {
    makeRef: (element) => {
      const osModal = document.getElementById(element);
      return bootstrap.Modal.getOrCreateInstance(osModal, { backdrop: 'static' });
    },
    show: (element) => {
      const osModalRef = PSA.modal.makeRef(element);
      osModalRef.show();
    },
    hide: (element) => {
      const osModalRef = PSA.modal.makeRef(element);
      osModalRef.hide();
    },
    toggle: (element) => {
      const osModalRef = PSA.modal.makeRef(element);
      osModalRef.toggle();
    },
    listenShow: (element, callback) => {
      document.getElementById(element).addEventListener('shown.bs.modal', callback);
    },
    listenHide: (element, callback) => {
      document.getElementById(element).addEventListener('hide.bs.modal', callback);
    },
  },
  event: {
    remove: (type, listener) => {
      window.removeEventListener(remove, listener, false);
    },
    //  PSA.event.listen('search_organization', data=>{name})
    listen: (type, callback) => {
      document.addEventListener(type, (e) => {
        callback(e.detail);
      });
    },
    // PSA.event.trigger('search_organization', {name: 'aa})
    trigger: (type, data) => {
      const event = new CustomEvent(type, {
        detail: data,
      });
      document.dispatchEvent(event);
    },
  },
  form: {
    reset() {
      window.location = window.location.pathname;
    },
  },
  // form validation
  fv: {
    addField: (fvRef, name) => {
      fvRef.addField(name, {
        validators: {
          notEmpty: {
            message: __('This Field is Required.'),
          },
        },
      });
    },
    removeField: (fvRef, name) => {
      try {
        fvRef.removeField(name);
      } catch (e) {
        // empty
      }
    },
    fieldsMaker: {
      comparePassword: (passwordKey, confirmPasswordKey) => ({
        [passwordKey]: {
          validators: {
            notEmpty: {
              message: 'The password is required',
            },
            callback: {
              message: 'Please enter valid password',
              callback(input) {
                if (input.value.length > 0) {
                  return validatePassword();
                }
              },
            },
          },
        },
        [confirmPasswordKey]: {
          validators: {
            notEmpty: {
              message: 'The password confirmation is required',
            },
            identical: {
              compare() {
                return form.querySelector(`[name="${passwordKey}"]`).value;
              },
              message: 'The password and its confirm are not the same',
            },
          },
        },
      }),
    },
    init: (formRef, requiredFields = [], customFields = {}, options = { submit: true }) => {
      const allFields = requiredFields;
      if (typeof formRef === 'string') {
        formRef = document.getElementById(formRef);
      }
      if (!requiredFields.length) {
        formRef.querySelectorAll('[required]').forEach((f) => {
          allFields.push(f.name);
        });
      }
      const fields = {};
      for (const rf of allFields) {
        fields[rf] = {
          validators: {
            notEmpty: {
              message: __('This Field is Required'),
            },
          },
        };
      }

      const plugins = {
        trigger: new FormValidation.plugins.Trigger(),
        // Validate fields when clicking the Submit button
        submitButton: new FormValidation.plugins.SubmitButton(),
        // Submit the form when all fields are valid
        bootstrap: new FormValidation.plugins.Bootstrap5({
          rowSelector: '.fv-row',
          eleInvalidClass: '',
          eleValidClass: '',
        }),
      };
      if (options.submit) {
        plugins.defaultSubmit = new FormValidation.plugins.DefaultSubmit();
      }
      // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
      return FormValidation.formValidation(
        formRef,
        {
          fields: { ...fields, ...customFields },
          plugins,
        },
      );
    },
    onFormValidate: (fv, callback) => {
      fv.on('core.form.valid', callback);
    },
    reset: (fv) => {
      fv.resetForm({ reset: true });
    },
  },
  date: {
    dateFormat(date) {
      return date ? moment(date).format(defaultDateFormat) : '';
    },
    dateFormatShort(date) {
      return date ? moment(date).format(defaultShortDateFormat) : '';
    },
    dateTimeFormat(date) {
      return date ? moment(date).format(defaultDateTimeFormat) : '';
    },
    timeFormat(date) {
      return date ? moment(date).format(defaultTimeFormat) : '';
    },
  },
  helpers: {
    capitalizeFirstLetter(string) {
      return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      const byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      const ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      const ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      const blob = new Blob([ab], { type: mimeString });
      return blob;
    },
    getEmpName(emp) {
      if (!emp || typeof emp !== 'object') return '';
      return getLang() === 'ar' ? emp.fullNameAr : emp.fullNameEn;
    },
    frequencyToText(Frequency) {
      const f = parseInt(Frequency, 10);
      if (f === 12) return __('Monthly');
      if (f === 4) return __('Quarterly');
      if (f === 2) return __('Half Yearly');
      if (f === 1) return __('Yearly');
      return Frequency;
    },
    roundNumber(iValue, precision = 2) {
      let value = iValue;
      if (typeof value === 'string') value = number.toNumber(value);
      if (typeof value !== 'number') return null;
      return Number(`${Math.round(`${value}e${precision}`)}e-${precision}`);
    },
  },
  tooltip: {
    // eg
    //    init('span')
    //    init(document.getElementsByClassName('className'))
    init: (element) => {
      const osTooltip = typeof element === 'object' ? element : document.querySelectorAll(element);
      for (let i = 0, len = osTooltip.length; i < len; i++) {
        bootstrap.Tooltip.getOrCreateInstance(osTooltip[i]);
      }
    },
  },
  badges: {
    custom: (label, classes, color, textColor) => (`<span class="badge ${classes || ''}" ${color || textColor ? `style="background-color:${color};color:${textColor}!important;"` : ''}>${label}</span>`),
    primary: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-primary`),
    light: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-light`),
    secondary: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-secondary`),
    success: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-success`),
    info: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-info`),
    warning: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-warning`),
    danger: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-danger`),
    dark: (label, light = false) => PSA.badges.custom(label, `badge${light ? '-light' : ''}-dark`),
    activeInactive: (act) => (act ? PSA.badges.success(__('Active')) : PSA.badges.danger(__('Inactive'))),
    organizationLevel: (level, text, size, theme = 'dark') => {
      switch (level) {
        // old colors ['#AC193D', '#2672EC', '#8C0095', '#5133AB', '#008299', '#D24726', '#008A00', '#094AB2']
        case 0:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[0]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[0]);
        case 1:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[1]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[1]);
        case 2:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[2]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[2]);
        case 3:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[3]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[3]);
        case 4:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[4]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[4]);
        case 5:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[5]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[5]);
        default:
          if (theme === 'light') return PSA.badges.custom(text || level, size ? `badge-${size} badge-light-dark` : '', null, organizationTypeColors[6]);
          return PSA.badges.custom(text || level, size ? `badge-${size}` : '', organizationTypeColors[6]);
      }
    },
    operationLevel: (level, text) => {
      switch (level) {
        // old colors ["#AC193D", "#2672EC", "#8C0095", "#5133AB"]
        case 1:
          return PSA.badges.custom(text || level, null, operationLevelColors[0]);
        case 2:
          return PSA.badges.custom(text || level, null, operationLevelColors[1]);
        case 3:
          return PSA.badges.custom(text || level, null, operationLevelColors[2]);
        case 4:
          return PSA.badges.custom(text || level, null, operationLevelColors[3]);
        default:
          return text || level;
      }
    },
    kpiTargetType: (type, text) => {
      switch (type) {
        case 'Local':
          return PSA.badges.success(type || text, true);
        case 'Federal':
          return PSA.badges.info(type || text, true);
        case 'Combine':
          return PSA.badges.danger(type || text, true);
        default:
          return type || text;
      }
    },
    classification: (type, text) => {
      switch (type) {
        case 'public':
          return PSA.badges.success(type || text, true);
        case 'restricted':
          return PSA.badges.info(type || text, true);
        case 'confidential':
          return PSA.badges.warning(type || text, true);
        case 'topsecret':
          return PSA.badges.danger(type || text, true);
        default:
          return type || text;
      }
    },
    notification: (type) => {
      switch (type) {
        case 'info':
          return PSA.badges.info(__(type));
        case 'warning':
          return PSA.badges.warning(__(type));
        case 'success':
          return PSA.badges.success(__(type));
        case 'error':
          return PSA.badges.danger(__(type));
        default:
          return type || text;
      }
    },
    dataChangeStatus: (type, text) => {
      switch (type) {
        case 'requested':
          return PSA.badges.info(type || text);
        case 'approved':
          return PSA.badges.success(type || text);
        case 'rejected':
          return PSA.badges.danger(type || text);
        case 'returned':
          return PSA.badges.warning(type || text);
        default:
          return type || text;
      }
    },
    yesNo: (yes) => {
      if (yes) {
        return PSA.badges.success(__('Yes'));
      }
      return PSA.badges.danger(__('No'));
    },
  },
  buttons: {
    tableMenu: (menuItems) => (`
    <div class="ms-2">
          <button type="button" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
              <span class="svg-icon svg-icon-5 m-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="10" y="10" width="4" height="4" rx="2" fill="black" />
                      <rect x="17" y="10" width="4" height="4" rx="2" fill="black" />
                      <rect x="3" y="10" width="4" height="4" rx="2" fill="black" />
                  </svg>
              </span>
          </button>
          <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-200px py-4" data-kt-menu="true">
              ${menuItems}
          </div>
      </div>
    `),
    table: ({
      url,
      title,
      theme = 'primary',
      icon = 'flaticon2-gear',
      onClick,
    }) => (`
    <a  class="tbl-tp btn btn-sm btn-icon btn-bg-light btn-active-color-${theme}" 
            data-bs-toggle="tooltip" data-bs-placement="top" title="${title}"
             href="${url ? BASE_URL + url : 'javascript:void(0)'}" onclick="${onClick || null}">
             <i class="${icon}"></i>
         </a>
    `),
    tableActiveInactive: ({
      active,
      id,
      url,
    }) => (`
    <button 
        class="tbl-tp btn btn-sm btn-icon btn-bg-light ${!active ? 'btn-active-color-success' : 'btn-active-color-danger'} "
               href="javascript:;" 
               data-bs-toggle="tooltip" data-bs-placement="top" title="${active ? __('Inactive') : __('Active')}"
               onclick="document.getElementById('${id}').submit();">
               <i class="fa ${!active ? 'fa-check' : 'fa-times'}"></i>
   </button>
    <form 
        method="post" 
        action="${BASE_URL}${url}/status/?_method=PUT"
                          id="${id}">
    </form>
    `),
  },
  exception: {
    catch: (e) => {
      PSA.loading(false);
      PSA.toast.error(e && e.message ? e.message : 'Something went wrong');
    },
    // finally(s) => () => loading(false, s);
  },
  confirmation: ({
    title = __('Confirmation'), body, success, icon = 'warning',
  }) => new Promise((resolve, reject) => {
    Swal.fire({
      title,
      text: body,
      icon,
      showCancelButton: true,
      confirmButtonText: __('Yes'),
      cancelButtonText: __('No'),
    }).then((result) => {
      if (result.value) {
        if (success) {
          Swal.fire(success.title, success.body, 'success');
        }
        resolve({
          success: ({ title: tt = __('Success'), body: bb }) => {
            Swal.fire(tt, bb, 'success');
          },
          error: ({ title: tt = __('Error'), body: bb }) => {
            Swal.fire(tt, bb, 'error');
          },
        });
      } else {
        reject();
      }
    });
  }),
  loading(start = true) {
    if (start) {
      document.body.classList.add('page-loading');
    } else {
      document.body.classList.remove('page-loading');
    }
  },
  loadingBlock(selector = 'body', start = true) {
    if (start) {
      document.querySelector(selector).innerHTML = `<div class="spinner d-flex justify-content-center">
        <span class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </span>
      </div> `;
    } else {
      const ele = document.querySelector(selector);
      if (ele) {
        for (const iterator of ele.getElementsByClassName('spinner')) {
          iterator.remove();
        }
      }
    }
  },

  nameToIcon(nameAr, nameEn, lng) {
    const name = (lng === 'ar') ? nameAr : nameEn;
    const style = ['warning', 'primary', 'success', 'danger'];
    const random = Math.floor(Math.random() * style.length);
    return `
    <div class="symbol-label bg-light-${style[random]}">
        <span class="text-${style[random]}">${name.charAt(0)}</span>
    </div>`;
  },

  courseRequestApprovalLabel(finalApproved, HRApproved,initApproved,rejected) {
    if(rejected){
      return `<span class="badge badge-sm badge-light-danger d-inline">${__('Rejected')}</span>`
     }
    else if(finalApproved){
      return `<span class="badge badge-sm badge-light-success d-inline">${__('Final Approval')}</span>`
   }
   else if(HRApproved && initApproved){
    return `
      <span class="badge badge-sm badge-light-info d-inline m-1">${__('HR Approval')}</span>
      <span class="badge badge-sm badge-light-primary d-inline m-1">${__('Initial Approval')}</span>
      `
   }
   else if(HRApproved){
    return `
      <span class="badge badge-sm badge-light-info d-inline m-1">${__('HR Approval')}</span>
    `
   }
   else if(initApproved){
    return `
      <span class="badge badge-sm badge-light-primary d-inline m-1">${__('Initial Approval')}</span>
    `
   }
   else{
    return `
      <span class="badge badge-sm badge-light-warning d-inline m-1">${__('Not Approved')} </span>
    `
   }
  },



};
