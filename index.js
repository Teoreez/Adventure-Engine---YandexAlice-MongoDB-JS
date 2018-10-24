//Алиса
const { Alice, Reply, Scene, Markup } = require('yandex-dialogs-sdk');
const alice = new Alice();
const NameSelect = Scene(NameSelect);
const NewGame = Scene(NewGame);
const NextMove = Scene(NextMove);
const ContinueGame = Scene(CentinueGame);

//База данных
const mongoose = require('mongoose');
const UserData = require('./models/users.js');
const GameData = require('./models/gamedata.js');
mongoose.connect(process.env.MongoDB_URL,
	{
		useMongoClient: true
	});

//Приветсвтие
alice.welcome( ctx => {
	Reply.text('Добро пожаловать! Желаете начать игру или продолжить?', {
		buttons: ['Начать игру', 'Продолжить', 'Об игре'],
	  });
})
alice.command('Об игре', ctx =>{
	Reply.text('Я даже и не знаю с чего начать...');
})
//Начать
alice.command('Продолжить игру' || 'Начать игру', ctx => { 
	UserData.findOne({ uid: ctx.userId }).exec(function (err, userdata) {
		if (err) console.log(err);
		return userdata();
	})
	if (userdata.uid != ctx.userId) {
		Reply.text('Придумайте имя?'),
		ctx.enter(NameSelect);
	} else {
		ctx.enter(NewGame);
	}
})

NameSelect.any(ctx => {
	var NewName = new UserData({
		name: ctx.message,
		uid: ctx.userId,
		stateofgame: '0',
	});
	ctx.state.stateofgame = userdata.stateofgame
	ctx.enter(NewGame);
	Reply.text('Скажите что угодно что бы начать...');
})
NewGame.any(ctx => {
	GameData.findOne({ state: userdata.stateofgame}).exec(function (err, gamedata){
		if (err) console.log(err);
		return gamedata();
	})
	
	Reply.text(gamedata.text, { buttons: gamedata.buttons})
	ctx.enter(NextMove);
})

NextMove.any(ctx => {	
	var buttonid = gamedata.buttons.lastIndexOf(ctx.message);
	if (ctx.message == gamedata.buttons[0] || gamedata.buttons[1] || gamedata.buttons[2] || gamedata.buttons[3] || gamedata.buttons[4]) {
		ctx.state.stateofgame = gamedata.goto[buttonid];
	var updatestate = new UserData({
		stateofgame: ctx.state.stateofgame,
	});
	ctx.enter(ContinueGame);
	} else {
		Reply.text('Вы не можете так поступить...');
		ctx.enter(ContinueGame);
	}
})

ContinueGame.any(ctx => {
	GameData.findOne({ state: ctx.state.stateofgame}).exec(function (err,gamedata){
		if (err) console.log(err);
		return gamedata();
	})
	Reply.text(gamedata.text, { buttons: gamedata.buttons})
	ctx.enter(NextMove);
})


//Сервер
const port = 3001
alice.listen('/', port, callback => console.log(port))