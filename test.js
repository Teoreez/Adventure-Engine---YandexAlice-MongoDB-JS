const { Alice, Scene, Reply, Markup } = require('yandex-dialogs-sdk');

const alice = new Alice();


const M = Markup;

const welcomeMatcher = ctx => ctx.data.session.new === true;
alice.command(welcomeMatcher, ctx =>
  Reply.text('Привет! Я загадала число от 1 до 100. Сможешь отгадать его?', {
    buttons: [M.button('Давай попробуем!'), M.button('Не хочу')],
  }),
);

alice.command('Нуп', ctx => {
	
	return Reply.text(
		`Ты победил! Я загадала число. Сыграешь ещё раз?`,
		{
			buttons: [M.button('Сыграть ещё раз!'), M.button('Не хочу')],
		},
	);
});

const server = alice.listen(8080, '/');



const nameSelect = async ctx => {
	
}





alice.any(/\b\w+\b/g, async ctx => {
	const newname = String(ctx.message);
	//console.log(ctx.message);
//await createname(newname);
return Reply.text('Ваше имя ' + newname + ' верно?', {
	buttons: ['Именно так', 'Это не совсем так'],
	});
});











alice.any(ctx => {
		if (ctx.session.nameSelect == true) {
			newname = String(ctx.message);
			return Reply.text('Ваше имя ' + newname + ' верно?', {
				buttons: ['Именно так', 'Это не совсем так'],
				});
		} else {
			return Reply.text('что то пошло не так');
		}
});