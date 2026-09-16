/**
 * Единая точка настройки контактов.
 * Поменяйте значения тут — телефон, ссылки и адрес обновятся везде на сайте.
 */
window.SITE_CONTACTS = {
  phone: "+7 (900) 000-00-00",
  phoneHref: "tel:+79000000000",
  whatsapp: "https://wa.me/79000000000?text=" + encodeURIComponent("Здравствуйте! Хочу узнать про аренду дачи."),
  telegram: "https://t.me/svoya_dacha_ekb",
  instagram: "https://www.instagram.com/svoya.dacha.ekb/",
  email: "hello@svoyadacha-ekb.ru",
  address: "Свердловская область, 30 км от Екатеринбурга",
  map: "https://yandex.ru/maps/?text=" + encodeURIComponent("Своя Дача, 30 км от Екатеринбурга"),
  // Если появится Formspree/Getform/своя форма — впишите endpoint сюда,
  // и main.js начнёт отправлять заявки по сети вместо локальной заглушки.
  formEndpoint: ""
};
