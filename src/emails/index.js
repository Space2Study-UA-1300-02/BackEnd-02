const emailSubject = require('~/consts/emailSubject')

const templateList = {
  [emailSubject.EMAIL_CONFIRMATION]: {
    en: {
      subject: 'Please confirm your email',
      template: '../src/emails/en/confirm-email'
    },
    ua: {
      subject: 'Будь ласка, підтвердіть свою електронну адресу',
      template: '../src/emails/ua/confirm-email'
    }
  },
  [emailSubject.RESET_PASSWORD]: {
    en: {
      subject: 'Reset your account password',
      template: '../src/emails/en/reset-password'
    },
    ua: {
      subject: 'Скиньте пароль для свого акаунту',
      template: '../src/emails/ua/reset-password'
    }
  },
  [emailSubject.SUCCESSFUL_PASSWORD_RESET]: {
    en: {
      subject: 'Your password was changed',
      template: '../src/emails/en/sucessful-password-reset'
    },
    ua: {
      subject: 'Ваш пароль було змінено',
      template: '../src/emails/ua/sucessful-password-reset'
    }
  },
  [emailSubject.LONG_TIME_WITHOUT_LOGIN]: {
    en: {
      subject: 'You have been inactive for too long',
      template: '../src/emails/en/long-time-without-login'
    },
    ua: {
      subject: 'Ви занадто довго були неактивні',
      template: '../src/emails/ua/long-time-without-login'
    }
  },
  [emailSubject.ADMIN_INVITATION]: {
    en: {
      subject: 'Admin invitation',
      template: '../src/emails/en/invite-admin'
    },
    ua: {
      subject: 'Запрошення адміна',
      template: '../src/emails/ua/invite-admin'
    }
  }
}

module.exports = { templateList }
