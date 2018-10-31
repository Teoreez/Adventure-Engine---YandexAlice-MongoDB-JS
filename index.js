//Алиса
const { Alice, Reply, Scene, Markup } = require('yandex-dialogs-sdk');
const alice = new Alice();
const NAME_SELECT = 'NAME_SELECT';
const NEXT_MOVE = 'NEXT_MOVE';
//const NameSelect = new Scene(NAME_SELECT); - временно реализовано через отлов any
const NextMove = new Scene(NEXT_MOVE);
const M = Markup;

//База данных
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Adventure');
const Users = require('./models/users.js');
const gameData = require('./models/gamedata.js');

//функции работы с БД
//костыль для получения userId
function uid(ctx){
    const uid = String(ctx.userId);
    return uid;
};
//получение объекта пользователя из БД
async function queryname(uname) {
    const userdata = await Users.findOne({ uid: uname }).lean().exec();
    return userdata;
};
async function querygame(ustate) {
    const gamedata = await gameData.findOne({ state: ustate}).lean().exec();
    return gamedata;
};
async function updateusers(newname, newstate) {
    const newname = new Users({
        name: newname,
        uid: uid(ctx),
        stateofgame: newstate,
    });
    await newname.save();
};

async function nextmove(ctx) {
    const stateofgame = ctx.session.get('stateofgame');
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
    ctx.session.set('nameSelect', true);
    return Reply.text('Придумайте новое имя');
};

//продолжение игры, плюс проверка на наличие имени пользователя
const startGame = async ctx => {
	const userdata = await queryname(uid(ctx));
	const gamedata = await querygame(ctx.session.get('stateofgame'));
    ctx.session.set('stateofgame', userdata.stateofgame);
    function usercheck(ctx) {
        if (userdata.name == undefined) { 
            ctx.session.set('nameselect', true)
            Reply.text('Придумайте новое имя');
            
        } else {
            ctx.enter(NEXT_MOVE);
            Reply.text(gamedata.text, { buttons: gamedata.buttons});
            
        };
    
    };
    
};

//команды основного меню
alice.command('Начать новую игру', startNewGame);
alice.command('Продолжить', startGame);

//Начало функционального лупа - основого диалога внутри комнаты хода
NextMove.any( async ctx => {	
	var buttonid = gamedata.buttons.lastIndexOf(ctx.message);
	if (ctx.message == gamedata.buttons[0] || gamedata.buttons[1] || gamedata.buttons[2] || gamedata.buttons[3] || gamedata.buttons[4]) {
    ctx.session.set('stateofgame', gamedata.goto[buttonid]);
	await updateusers(uid(ctx), ctx.session.get('stateofgame'));
	await nextmove(ctx);
	} else {
		Reply.text('Вы не можете так поступить...');
	}
});

//Отлов Any, а так же нового имени
alice.any(async ctx => {
    if (ctx.session.get('nameSelect') == true) {
        const newname = String(ctx.message);
        updateusers(newname, '0');
        ctx.session.set('name', newname);
        return Reply.text('Ваше имя ' + newname + ' верно?', {
            buttons: ['Именно так', 'Это не совсем так'],
            });
    } else {
        console.log(ctx.userId);
        return Reply.text('что то пошло не так');
    }
});
alice.command('Именно так', startGame);
alice.command('Это не совсем так', startNewGame);

//Сервер
const port = 3001
alice.listen(port, '/', callback => console.log(port))