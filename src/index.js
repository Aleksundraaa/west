import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, power) {
        super(name, power);
    }

    getDescriptions() {
        const creatureDescription = getCreatureDescription(this);
        const cardDescription = super.getDescriptions();
        return [creatureDescription, ...cardDescription];
    }
}
class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    };

    quacks() {
        console.log('quack');
    };

    swims() {
        console.log('float: both;');
    };

}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const newDamage = value - 1;
        this.view.signalAbility(() => continuation(newDamage));
    }

    getDescriptions() {
        const parentDescriptions = super.getDescriptions();

        return [
            ...parentDescriptions,
            'Получает на 1 урона меньше'
        ];
    }

}

class Lad extends Dog {
    constructor() {
        super('Браток', 2);
    };
    static getInGameCount() {
        return this.inGameCount || 0;
    };
    static setInGameCount(value){
        this.inGameCount = value;
    };

    static getBonus() {
        const count = this.getInGameCount();
        return (count + 1) * count / 2;
    };

    doAfterComingIntoPlay(gameContext, continuation) {
        const currentCount = Led.getInGameCount();
        Led.setInGameCount(currentCount + 1);
        continuation();

    };
    doBeforeRemoving(continuation) {
        const currentCount = Led.getInGameCount();
        Led.setInGameCount(currentCount - 1);
        continuation();
    };

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Led.getBonus();
        continuation(value + bonus);
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Led.getBonus();
        continuation(value - bonus);
    };

    getDescriptions() {
        const parentDescriptions = super.getDescriptions();
        const descriptions = [...parentDescriptions];

        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
          Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            descriptions.push('Чем их больше, тем они сильнее');
        }

        return descriptions;
    }
}

class Gatling extends Creature{
    constructor() {
        super('Гатлинг',6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, position, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        const oppositeCards = oppositePlayer.table.filter(card => card !== null);
        if (oppositeCards.length > 0) {
            oppositeCards.forEach(card => {
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            });
        }

        taskQueue.continueWith(continuation);
    }
}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Lad(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
