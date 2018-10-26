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
		buttons: ['Начать новую игру', 'Продолжить', 'Об игре'],
	  }),
);
alice.command('Об игре', ctx =>
	Reply.text('Я даже и не знаю с чего начать...'),
);
const startNewGame = ctx => {
    ctx.session.set('stateofgame', '0');
    ctx.enter(NameSelect);
    return Reply.text('Придумайте новое имя');
};

const startGame = ctx => {
    if (userdata.stateofgame != 0) {
        UserData.findOne({ uid: ctx.userId }).exec(function (err, userdata) {
			if (err) return handleError(err);
			return userdata();
        });
        ctx.session.set('stateofgame', userdata.stateofgame);
    } else {
        
    }
    GameData.findOne({ state: userdata.stateofgame}).exec(function (err, gamedata){
		if (err) return handleError(err);
		return gamedata();
    })
    return Reply.text(gamedata.text, { buttons: gamedata.buttons}),
    ctx.enter(NEXT_MOVE);
};


alice.command('Начать новую игру', startNewGame);
alice.command('Продолжить', startGame);

NameSelect.any( ctx => Reply.text(
    function newname(ctx) {
        var NewName = new UserData({
            name: ctx.message,
            uid: ctx.userId,
            stateofgame: '0',
        });
        UserData.save();
        var content = 'Ваше имя' + ctx.message + 'верно?';
        return content;
    }
));
NameSelect.command('да', startGame);
NameSelect.command('нет', startNewGame);


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