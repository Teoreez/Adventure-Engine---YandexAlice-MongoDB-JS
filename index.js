//Алиса
const { Alice, Reply, Scene, Markup } = require('yandex-dialogs-sdk');
const alice = new Alice();
const NAME_SELECT = 'NAME_SELECT';
const NEXT_MOVE = 'NEXT_MOVE';
const NameSelect = new Scene(NAME_SELECT);
const NextMove = new Scene(NEXT_MOVE);


//База данных
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Adventure');
const Users = require('./models/users.js');
const gameData = require('./models/gamedata.js');

//функции работы с БД
async function queryname(uname) {
    const userdata = UserData.findOne({ uid: uname }).lean().exec();
};
async function querygame(ustate) {
    const gamedata = gameData.findOne({ state: ustate}).lean().exec();
};
function createname(newname) {
    const newname = new Users({
        name: ctx.message,
        uid: ctx.userId,
        stateofgame: '0',
    });
    Users.save();
};
async function update(newstate) {
    const updatestate = new Users({
        stateofgame: newstate,
    });
    await  Users.save();
};
async function nextmove(ctx) {
    const stateofgame = ctx.session.stateofgame;
    const gamedata = await querygame(stateofgame);
    return Reply.text(gamedata.text, { buttons: gamedata.buttons});
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

//Начало игры
// Вилка диалога Продолжения игры и Создания новой игры
const startNewGame = async ctx => {
    ctx.session.set('stateofgame', '0');
    ctx.enter(NAME_SELECT);
    return Reply.text('Придумайте новое имя');
};

//продолжение игры, плюс проверка на наличие имени пользователя
const startGame = async ctx => {
	const userdata = await queryname(ctx.userId);
	const gamedata = await querygame(userdata.stateofgame);
    ctx.session.set('stateofgame', userdata.stateofgame);
    function usercheck(ctx) {
        if (userdata.name == undefined) { 
            ctx.enter(NAME_SELECT);
            return Reply.text('Придумайте новое имя');
        } else {
            ctx.enter(NEXT_MOVE);
            return Reply.text(gamedata.text, { buttons: gamedata.buttons});
        };
    };
    
};

//команды основного меню
alice.command('Начать новую игру', startNewGame);
alice.command('Продолжить', startGame);



const cheat = async ctx => {
    await ctx.enter(NEXT_MOVE);
    Reply.text('Чит');
};
alice.command('cheat', cheat);

//Создание Имени
NameSelect.any( async ctx => {
	const newname = ctx.message;
	createname(newname);
	return Reply.text('Ваше имя ' + newname + ' верно?');
});
NameSelect.command('да', startGame);
NameSelect.command('нет', startNewGame);


//Начало функционального лупа - основого диалога внутри комнаты хода
NextMove.any( async ctx => {	
	var buttonid = gamedata.buttons.lastIndexOf(ctx.message);
	if (ctx.message == gamedata.buttons[0] || gamedata.buttons[1] || gamedata.buttons[2] || gamedata.buttons[3] || gamedata.buttons[4]) {
    await ctx.session.set('stateofgame', gamedata.goto[buttonid]);
	update(ctx.session.stateofgame);
	nextmove(ctx);
	} else {
		Reply.text('Вы не можете так поступить...');
	}
});

alice.any(ctx => Reply.text('что то пошло не так'));

//Сервер
const port = 3001
alice.listen(port, '/', callback => console.log(port))