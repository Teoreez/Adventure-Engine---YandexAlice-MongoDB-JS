//Алиса
const { Alice, Reply, Scene, Markup } = require('yandex-dialogs-sdk');
const alice = new Alice();
const NAME_SELECT = 'NAME_SELECT';
const NEW_GAME = 'NEW_GAME';
const NEXT_MOVE = 'NEXT_MOVE';
const CONTINUE_GAME = 'CONTINUE_GAME'; 	
const NameSelect = new Scene(NAME_SELECT);
const NewGame = new Scene(NEW_GAME);
const NextMove = new Scene(NEXT_MOVE);
const ContinueGame = new Scene(CONTINUE_GAME);

//База данных
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Adventure');
const UserData = require('./models/users.js');
const GameData = require('./models/gamedata.js');


//Приветсвтие
alice.command('', ctx => 
	Reply.text('Добро пожаловать! Желаете начать игру или продолжить?', {
		buttons: ['Начать игру', 'Продолжить', 'Об игре'],
	  }),
);
alice.command('Об игре', ctx =>
	Reply.text('Я даже и не знаю с чего начать...'),
);
//Начать
alice.command(['Продолжить игру', 'Начать игру'], ctx => function (ctx) {
	UserData.findOne({ uid: ctx.userId }).exec(function (err, userdata) {
		if (err) return handleError(err);
		return userdata();
	});
	if (userdata.uid != ctx.userId) {
		return Reply.text('Придумайте имя?'),
		ctx.enter(NameSelect);
	} else {
		return Reply.text('Я тебя помню, продолжим...'),
		ctx.enter(NewGame);
	};
});
//Переходим в стадию зщадачи имени ctx.message => в имя
NameSelect.any(ctx => {
	var NewName = new UserData({
		name: ctx.message,
		uid: ctx.userId,
		stateofgame: '0',
	});
	ctx.state.stateofgame = userdata.stateofgame
	ctx.enter(NEW_GAME);
	Reply.text('Скажите что угодно что бы начать...');
});
//Начало цепочки для нового игрока
NewGame.any(ctx => {
	GameData.findOne({ state: userdata.stateofgame}).exec(function (err, gamedata){
		if (err) return handleError(err);
		return gamedata();
	})
	
	Reply.text(gamedata.text, { buttons: gamedata.buttons})
	ctx.enter(NEXT_MOVE);
});
//Определение варианта ответа и переход в продолжение цепочки
NextMove.any(ctx => {	
	var buttonid = gamedata.buttons.lastIndexOf(ctx.message);
	if (ctx.message == gamedata.buttons[0] || gamedata.buttons[1] || gamedata.buttons[2] || gamedata.buttons[3] || gamedata.buttons[4]) {
		ctx.state.stateofgame = gamedata.goto[buttonid];
	var updatestate = new UserData({
		stateofgame: ctx.state.stateofgame,
	});
	ctx.enter(CONTINUE_GAME);
	} else {
		Reply.text('Вы не можете так поступить...');
		ctx.enter(CONTINUE_GAME);
	}
});
//Продолжение диалога с возвращением к стадии разбора ответа от пользователя
ContinueGame.any(ctx => {
	GameData.findOne({ state: ctx.state.stateofgame}).exec(function (err,gamedata){
		if (err) return handleError(err);
		return gamedata();
	})
	Reply.text(gamedata.text, { buttons: gamedata.buttons})
	ctx.enter(NEXT_MOVE);
});


//Сервер
const port = 3001
alice.listen(port, '/', callback => console.log(port))