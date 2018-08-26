const Telegraf = require('telegraf');
const Composer = require('telegraf/composer');
const config = require('../config');
const posts = require('../db/models/posts');

const token = config.token;
const users = config.users;

let last_media_group = '';

const protection = new Composer();

protection.start(ctx => ctx.reply('Я готов!'));

protection.on('edited_message', ctx => {
  const message = ctx.editedMessage;

  const message_id = message.message_id;
  const text = message.text;
  const caption = message.caption;

  posts.update(
    {
      content: text ? text : caption
    },
    {
      where: { id: message_id }
    }
  );
});

protection.on('text', ctx => {
  const message = ctx.message;

  const message_id = message.message_id;
  const text = message.text;
  const parts = text.split('\n', 2);

  if (parts[0].startsWith('https://www.youtube.com/watch?')) {
    return posts.create({
      id: message_id,
      type: 'youtube',
      content: parts[1],
      annex: parts[0]
    })
      .then(() => ctx.reply('Ютуб-пост принят!'))
      .catch(() => ctx.reply('Произошла ошибка!'));
  }

  posts.create({
    id: message_id,
    type: 'text',
    content: text
  })
    .then(() => ctx.reply('Пост принят!'))
    .catch(() => ctx.reply('Произошла ошибка!'));
});

protection.on('audio', ctx => {
  const message = ctx.message;

  const message_id = message.message_id;
  const file_id = message.audio.file_id;
  const caption = message.caption;

  posts.create({
    id: message_id,
    type: 'audio',
    content: caption,
    annex: file_id
  })
    .then(() => ctx.reply('Аудио-пост принят! ID ' + message_id))
    .catch(() => ctx.reply('Произошла ошибка!'));
});

protection.on('document', ctx => {
  const message = ctx.message;

  const message_id = message.message_id;
  const file_id = message.document.file_id;
  const caption = message.caption;

  posts.create({
    id: message_id,
    type: 'document',
    content: caption,
    annex: file_id
  })
    .then(() => ctx.reply('Документ принят! ID ' + message_id))
    .catch(() => ctx.reply('Произошла ошибка!'));
});

protection.on('photo', ctx => {
  const message = ctx.message;

  const message_id = message.message_id;
  const media_group = message.media_group_id;
  const photo = message.photo.pop().file_id;
  const caption = message.caption;

  if (media_group) {
    return posts.create({
      id: message_id,
      type: 'album',
      content: media_group,
      annex: photo
    })
      .then(() => {
        if (last_media_group !== media_group) {
          last_media_group = media_group;

          ctx.reply('Фото-альбом принят!');
        }
      })
      .catch(() => {
        if (last_media_group !== media_group) {
          last_media_group = media_group;

          ctx.reply('Произошла ошибка! ID ' + message_id);
        }
      });
  }

  posts.create({
    id: message_id,
    type: 'photo',
    content: caption,
    annex: photo
  })
    .then(() => ctx.reply('Фото-пост принят! ID ' + message_id))
    .catch(() => ctx.reply('Произошла ошибка!'));
});

protection.on('video', ctx => {
  const message = ctx.message;

  const message_id = message.message_id;
  const file_id = message.video.file_id;
  const caption = message.caption;

  posts.create({
    id: message_id,
    type: 'video',
    content: caption,
    annex: file_id
  })
    .then(() => ctx.reply('Видео-пост принят! ID ' + message_id))
    .catch(() => ctx.reply('Произошла ошибка!'));
});

const telegraf = new Telegraf(token);

telegraf.use(Composer.acl(users, protection));

telegraf.help(ctx => ctx.reply(String(ctx.message.from.id)));

exports.start = () => {
  telegraf.startPolling();
};
