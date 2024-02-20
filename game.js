var config = { //Налаштовуємо сцену
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: { //Налаштовуємо фізику
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var score = 0;
var scoreText;

var record = 0

//Функція підбору зірок
function collectKiwi (player, kiwi)
{
    kiwi.disableBody(true, true);

    //Нараховуємо бали
    score += 10;
    scoreText.setText('Score: ' + score);

    //Створення бромб
    var bomb = bombs.create(x, 16, 'bomb').setScale(0.1);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);


    //Перестворення зірочок
    if (kiwis.countActive(true) === 0)
    {
        kiwis.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
            child.anims.play('kiwi_anim');
            child.setScale(1.5);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    }
}

//Після зіткнення 3
function hitBomb (player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;

    this.scene.restart();

    if(score > record){
        record = score;
        document.getElementById("record_text").innerHTML = "Рекорд :<br/>" + record;
    }
    score = 0
}

function preload () //Завантажуємо графіку для гри
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('kiwi', 'assets/Kiwi.png',{ frameWidth: 32, frameHeight: 32 });
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 32 }
    );
}

function create ()
{
    //Додаемо небо
    this.add.image(400, 215, 'sky').setScale(0.6);

    //Створюемо текст з рахунком
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    //Ініціалізуємо курсор Phaser
    cursors = this.input.keyboard.createCursorKeys();

    //Створюемо фізичну групу платформ
    platforms = this.physics.add.staticGroup();

    //Створюемо платформи
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    //Створюємо та налаштовуємо спрайт гравця
    player = this.physics.add.sprite(100, 450, 'dude').setScale(2);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //Створюемо та налаштовуємо фізичний об'єкт бомби
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //Змінено гравітацію гравця
    player.body.setGravityY(0)

    //Створення та налаштування зірок
    kiwis = this.physics.add.group({
        key: 'kiwi',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    //Анімація для ківі
    this.anims.create({
        key: 'kiwi_anim',
        frames: this.anims.generateFrameNumbers('kiwi', { start: 0, end: 16 }),
        frameRate: 16,
        repeat: -1
    });

    kiwis.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.anims.play('kiwi_anim');
        child.setScale(1.5);
    });

    //Створюємо та налаштовуємо анімації
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //Додано колізії між гравцем та платформами
    this.physics.add.collider(player, platforms);

    //Додано колізію між зірками та платформами
    this.physics.add.collider(kiwis, platforms);

    //Додано перевірку дотику до зірки
    this.physics.add.overlap(player, kiwis, collectKiwi, null, this);
}

function update ()
{
    //Керування персонажем
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}