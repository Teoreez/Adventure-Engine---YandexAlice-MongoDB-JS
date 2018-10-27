const { Alice, Reply, Scene, Markup } = require('yandex-dialogs-sdk');
const alice = new Alice();
const NAME_SELECT = 'NAME_SELECT';
const NameSelect = new Scene(NAME_SELECT);


alice.command('', ctx => {
	return Reply.text('Добро пожаловать! Желаете начать игру или продолжить?', {
		buttons: ['Начать новую игру', 'Продолжить', 'Об игре'],
	  });
	});

alice.command('Раз', ctx => {
	//ctx.enter(NAME_SELECT);
	return Reply.text('Два');
});

const port = 3001
alice.listen(port, '/', callback => console.log(port))