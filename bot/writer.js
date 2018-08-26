const Telegram = require('telegraf/telegram');
const config = require('../config');
const posts = require('../db/models/posts');

const channel_name = '@Dota2Savage';
const token = config.token;
const routine = config.routine;
const interval = config.interval;

const api = new Telegram(token);

let last_hour = -1;

const youtube = (content, annex) => {
  const link = `<a href="${annex}">&#160;</a>`;

  api.sendMessage(channel_name, content + link, { parse_mode: 'html' });
};

const text = (content) => {
  api.sendMessage(channel_name, content, { parse_mode: 'html', disable_web_page_preview: true })
    .catch(() => {
      api.sendMessage(channel_name, 'На канале временно возникли технические неполадки. Держу в курсе. 😱');
    });
};

const audio = (content, annex) => {
  api.sendAudio(channel_name, annex, { caption: content });
};

const document = (content, annex) => {
  api.sendDocument(channel_name, annex, { caption: content });
};

const album = (content, annex) => {
  posts.findAll({
    where: {
      type: 'album',
      content: content
    }
  })
    .then(rows => {
      const photos = [{ type: 'photo', media: annex }];

      for (let row of rows) {
        photos.push({ type: 'photo', media: row.annex });
      }

      posts.destroy({
        where: { content: content }
      });

      api.sendMediaGroup(channel_name, photos);
    });
};

const photo = (content, annex) => {
  api.sendPhoto(channel_name, annex, { caption: content });
};

const video = (content, annex) => {
  api.sendVideo(channel_name, annex, { caption: content });
};

const standard = () => {
  posts.findOne({
    order: ['id']
  })
    .then(post => {
      if ( ! post) return;

      const type = post.type;
      const content = post.content;
      const annex = post.annex;

      post.destroy();

      switch (type) {
        case 'youtube': return youtube(content, annex);
        case 'text': return text(content);
        case 'audio': return audio(content, annex);
        case 'document': return document(content, annex);
        case 'album': return album(content, annex);
        case 'photo': return photo(content, annex);
        case 'video': return video(content, annex);
      }
    });
};

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const morning = () => {
  const first = [
    'Доброе утро! ',
    'Подъём! ',
    'Встаём! '
  ];

  const second = [
    'Кто рано встаёт, тому Гейб подаёт нормальных тиммейтов в соло ранкеде. ',
    'Каточку перед учёбой/работой? ',
    'Делаем зарядку и, конечно же, не забываем про утреннюю тренировку ластхита. '
  ];

  const third = [
    'А я уже готовлю новые посты. ✍️',
    'Новые посты совсем скоро! 🤙',
    'Уверен, сегодня посты не оставят вас равнодушными. 😊'
  ];

  const message = randomElement(first) + randomElement(second) + randomElement(third);
  api.sendMessage(channel_name, message);
};

const evening = () => {
  const first = [
    'Спокойной ночи. ',
    'Заканчиваем играть - ложимся спать. ',
    'Приятных снов! '
  ];

  const second = [
    'Режим дня очень важен для здоровья и это не шутка. ',
    'Позвольте своему подсознанию разложить по полочкам накопленный за день опыт. ',
    'Опровергнем миф о том, что дотер спит только под действием Nightmare 😈. '
  ];

  const third = [
    'Увидимся завтра! 😉',
    'Завтра нас ждут новые посты! 🙂',
    'Завтра будет, что почитать. 🙃'
  ];

  const message = randomElement(first) + randomElement(second) + randomElement(third);
  api.sendMessage(channel_name, message);
};

const main = () => {
  const date = new Date();
  const hour = date.getHours();

  if (hour === last_hour) return;

  last_hour = hour;

  const task = routine[hour];

  switch (task) {
    case "standard": return standard();
    case "morning": return morning();
    case "evening": return evening();
  }
};

exports.start = () => {
  setInterval(main, interval * 6e4);
};
