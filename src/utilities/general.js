const appConfig = require('../config');

module.exports = {
  nameToIcon: (employee, language) => {
    if (employee.profilePhotoDocumentID) {
      return `<img src="${appConfig.BASE_URL}employee/document/${employee.employeeID}" alt="">`;
    }
    const name = (language === 'ar') ? employee.fullNameAr : employee.fullNameEn;
    const style = ['warning', 'primary', 'success', 'danger'];
    const random = Math.floor(Math.random() * style.length);
    return `
        <div class="symbol-label bg-light-${style[random]}">
            <span class="text-${style[random]}">${name.charAt(0)}</span>
        </div>`;
  },
};
