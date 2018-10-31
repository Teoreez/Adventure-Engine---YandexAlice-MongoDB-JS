const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Adventure');
const gameData = require('./models/gamedata.js');

async function createstuff(state, goto) {
    const newdata = new gameData({
      state: state,
      text: 'Линия текстового диалога:' + state,
      buttons: ['Вариант диалога 1', 'Вариант диалога2', 'Вариант диалога3'],
      goto: [goto,goto,goto]
    });
    await newdata.save();
    console.log('data state' + state + ' ' + goto +' done');
};

createstuff('1', '2');
createstuff('2', '1');

console.log('done');