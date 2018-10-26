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
const Users = require('./models/users.js');
const gameData = require('./models/gamedata.js');

async function queryname(uname) {
    const userdata = UserData.findOne({ uid: uname }).lean().exec();
};
async function querygame(ustate) {
    const gamedata = gameData.findOne({ state: ustate}).lean().exec();
};
async function createname(newname) {
    const newname = new Users({
        name: ctx.message,
        uid: ctx.userId,
        stateofgame: '0',
    });
    await Users.save();
};
async function update(newstate) {
    const updatestate = new Users({
        stateofgame: newstate,
    });
    await  Users.save();
};

//Приветсвтие
alice.command('', ctx => 
	Reply.text('Добро пожаловать! Желаете начать игру или продолжить?', {
		buttons: ['Начать новую игру', 'Продолжить', 'Об игре'],
	  }),
);
alice.command('Об игре', ctx =>
	Reply.text('Я даже и не знаю с чего начать...'),
);
const startNewGame = async ctx => {
    ctx.session.set('stateofgame', '0');
    ctx.enter(NameSelect);
    return Reply.text('Придумайте новое имя');
};

const startGame = async ctx => {
	const userdata = await queryname(ctx.userId);
	const gamedata = await querygame(userdata.stateofgame);
	ctx.session.set('stateofgame', userdata.stateofgame);
    return Reply.text(gamedata.text, { buttons: gamedata.buttons}),
    ctx.enter(NEXT_MOVE);
};


alice.command('Начать новую игру', startNewGame);
alice.command('Продолжить', startGame);

NameSelect.any(async ctx => Reply.text(
	async function (ctx){
		const newname = ctx.message;
		await createname(newname);
		return 'Ваше имя' + ctx.message + 'верно?';
	}
));
NameSelect.command('да', startGame);
NameSelect.command('нет', startNewGame);


NextMove.any( async ctx => {	
	var buttonid = gamedata.buttons.lastIndexOf(ctx.message);
	if (ctx.message == gamedata.buttons[0] || gamedata.buttons[1] || gamedata.buttons[2] || gamedata.buttons[3] || gamedata.buttons[4]) {
	ctx.state.set('stateofgame', gamedata.goto[buttonid]);
	update(ctx.state.stateofgame)
	ctx.enter(CONTINUE_GAME);
	} else {
		Reply.text('Вы не можете так поступить...');
	}
});

ContinueGame.any( async ctx => {
	const gamedata = await querygame(ctx.session.stateofgame);
	Reply.text(gamedata.text, { buttons: gamedata.buttons})
	ctx.enter(NEXT_MOVE);
});



//Сервер
const port = 3001
alice.listen(port, '/', callback => console.log(port))