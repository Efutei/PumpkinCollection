// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    marker: './img/fire_gas.png',
    ghost: './img/haloween_obake.png',
    pumpkin0: './img/halloween_pumpkin1.png',
    pumpkin1: './img/halloween_pumpkin2.png',
    pumpkin2: './img/halloween_pumpkin3.png',
    pumpkin3: './img/halloween_pumpkin4.png',
    pumpkin4: './img/halloween_pumpkin5.png',
    pumpkin5: './img/halloween_pumpkin6.png',
    pumpkin6: './img/halloween_pumpkin7.png',
    pumpkin7: './img/halloween_pumpkin8.png',
    pumpkin8: './img/halloween_pumpkin9.png',
    bat: './img/animal_koumori.png',
    moon: './img/mark_tenki_moon.png',
    star: './img/mark_tenki_star.png',
    house: './img/halloween_house.png'
  },
  sound: {
    fire: './sound/matchstick-put-fire1.mp3',
    get: './sound/puyon1.mp3',
    laughter: './sound/eerie-laughter1.mp3'
  }
};

var SCREEN_WIDTH  = 465;
var SCREEN_HEIGHT = 665;

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    // 背景色を指定
    this.backgroundColor = '#444';
    this.backLayer = DisplayElement().addChildTo(this);
    this.frontLayer = DisplayElement().addChildTo(this);
    this.moon = Moon().addChildTo(this.backLayer);
    this.stars = [];
    this.stars.push(Star(390, 180).addChildTo(this.backLayer));
    this.stars.push(Star(100, 280).addChildTo(this.backLayer));
    this.house = House().addChildTo(this.backLayer);
    this.scoreCounter = 0;
    this.scoreText = ScoreText(this.scoreCounter).addChildTo(this.backLayer);
    this.ghost = Ghost().addChildTo(this.backLayer);
    this.marker = Marker().addChildTo(this.frontLayer);
    this.pumpkins = [];
    this.bats = [];
    this.pumpkinSpown = 30;
    this.batSpown = 50;
    this.time = 0;
    this.rank = 1;
    this.total = 1;
  },

  update: function(app) {
    var p = app.pointer;
    if(p.getPointingStart()){
      this.marker.setPosition(p.x, p.y);
      SoundManager.play('fire');
    }
    this.time += app.deltaTime;
    this.scoreText.text = this.scoreCounter;
    if(this.ghost.isDead){
      this.ghost.scaleY = -1;
      this.ghost.y -= 10;
      this.exit({
        score: this.scoreCounter,
        hashtags: 'PumColle, phina_js',
        url: 'http://jsrun.it/FTP/PumColle',
      });
    }else{
      this.ghost.move(this.marker.x, this.marker.y);
      this.ghost.fuwafuwa(this.time);
    }

    this.marker.scaleX *= -1;
    if(this.ghost.outOfWindow()){
      SoundManager.play('laughter');
      this.ghost.isDead = true;
    }
    if(this.time % this.pumpkinSpown === 0){
      this.pumpkins.push(Pumpkin().addChildTo(this.backLayer));
    }
    if(this.time % this.batSpown === 0){
      this.bats.push(Bat().addChildTo(this.backLayer));
    }
    this.pumpkins.forEach(
      function(item, index){
        item.drop();
        if(this.ghost.onHit(item.x, item.y) && !this.ghost.isDead){
          SoundManager.play('get');
          item.y = -1000;
          this.pumpkins.splice(index, 1);
          this.scoreCounter += 100;
          if(this.scoreCounter % 300 === 0 && this.pumpkinSpown > 10){
            this.pumpkinSpown -= 1;
          }
          if(this.scoreCounter % 300  === 0 && this.batSpown > 10){
            this.batSpown -= 1;
          }
        }
        if(item.outOfWindow()){
          item.y = -1000;
          this.pumpkins.splice(index, 1);
        }
      },this
    );
    this.bats.forEach(
      function(item, index){
        item.fly(this.scoreCounter / 1000 + 1);
        item.patapata(this.time);
        if(this.ghost.onHit(item.x, item.y)){
          SoundManager.play('laughter');
          this.ghost.isDead = true;
        }
        if(item.outOfWindow()){
          item.y = 1000;
          this.bats.splice(index, 1);
        }
      },this
    );

  }
});

phina.define('Ghost',{
  superClass: 'Sprite',

  init: function(){
    this.superInit('ghost', 79, 95);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2;
    this.speed = 3;
    this.isDead = false;
  },

  move: function(mx, my){
    this.direction = Vector2(mx - this.x, my - this.y).normalize();
    if(this.x - mx > 0){
      this.scaleX = 1;
    }else if(this.x - mx < 0){
      this.scaleX = -1;
    }
    this.x -= this.speed * this.direction.x;
    this.y -= this.speed * this.direction.y;

  },

  fuwafuwa: function(t){
    this.y += 6 * Math.sin(t / 128);
  },

  onHit: function(x, y){
    this.distance = Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y - y,2));
    if(this.distance < 30){
      return true;
    }
    return false;
  },

  outOfWindow: function(){
    if(this.x < -20 || this.x > SCREEN_WIDTH + 40 || this.y < -30 || this.y > SCREEN_HEIGHT + 40){
      return true;
    }else{
      return false;
    }
  }
});

phina.define('Marker',{
  superClass: 'Sprite',

  init: function(){
    this.superInit('marker', 64, 64);
    this.x = -1000;
    this.y = -1000;
  },

});

phina.define('Bat',{
  superClass: 'Sprite',

  init: function(){
    this.superInit('bat', 64,64);
    if(Math.floor(Math.random()*2)%2 == 1){
      this.scaleX = 1;
      this.x = -5;
    }else{
      this.scaleX = -1;
      this.x = SCREEN_WIDTH + 5;
    }
    this.y = 10 + (Math.random() * SCREEN_HEIGHT - 20);
    this.speed = 3 * this.scaleX;
  },

  fly: function(score){
    this.x += this.speed * score;
  },

  patapata: function(t){
    this.y += 2 * Math.sin(t / 32);
  },

  outOfWindow: function(){
    if(this.x < -20 || this.x > SCREEN_WIDTH + 40){
      return true;
    }else{
      return false;
    }
  }

});

phina.define('Pumpkin',{
  superClass: 'Sprite',

  init: function(){
    this.img = "pumpkin" + Math.floor(Math.random() * 9);
    this.superInit(this.img, 64, 64);
    this.speed = 3;
    this.x = 10 + (Math.random() * SCREEN_HEIGHT - 20);
  },

  drop: function(){
    this.y += this.speed;
  },

  setRandomX: function(){
    this.x = Math.random() * SCREEN_WIDTH;
  },

  outOfWindow: function(){
    if(this.y > 1000){
      return true;
    }else{
      return false;
    }
  }

});

phina.define('Moon',{
  superClass: 'Sprite',

  init: function(){
    this.superInit('moon', 128, 128);
    this.x = 80;
    this.y = 80;
    this.scaleX = -1;
    this.scaleY = 1;
  },

});

phina.define('Star',{
  superClass: 'Sprite',

  init: function(x, y){
    this.superInit('star', 32, 32);
    this.x = x;
    this.y = y;
  },

});

phina.define('House',{
  superClass: 'Sprite',

  init: function(x, y){
    this.superInit('house', 256, 256);
    this.x = 180;
    this.y = SCREEN_HEIGHT - 115;
  },

});

phina.define('ScoreText',{
  superClass: 'Label',

  init: function(){
    this.superInit();
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2;
    this.fill = "white";
  },
});

// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    title: 'かぼちゃ集め',
    startLabel: location.search.substr(1).toObject().scene || 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    backgroundColor: '#344',
  });
  //iphone用ダミー音
  app.domElement.addEventListener('touchend', function dummy() {
    var s = phina.asset.Sound();
    s.loadFromBuffer();
    s.play().stop();
    app.domElement.removeEventListener('touchend', dummy);
  });
  // アプリケーション実行
  app.run();
});
