'use strict';
class Player {
	constructor(x, y) {
		this.hp = 100;
		this.x = x;
		this.y = y;
	}
	update(dt) {
		if (keys[37] || keys[65]) {
			player.x -= 200 * dt;
		}
		if (keys[39] || keys[68]) {
			player.x += 200 * dt;
		}
		if (keys[38] || keys[87]) {
			player.y -= 200 * dt;
		}
		if (keys[40] || keys[83]) {
			player.y += 200 * dt;
		}


		//За края не выходим
		if (player.x < 0) player.x = 0;
		if (player.y < 0) player.y = 0;
		if (player.y > cvs.height - 20) player.y = cvs.height - 20;
		if (player.x > (cvs.width - 20)) player.x = cvs.width - 20;
	}
	draw() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(-Math.atan2(this.x - mouseX, this.y - mouseY));
		ctx.drawImage(playerimg, -playerimg.width / 2, -playerimg.height / 2);
		ctx.restore();
	}
}
class Bullet {
	constructor(fromX, fromY, toX, toY) {
		let gradient = (fromX - toX) / (fromY - toY);
		if (gradient < 0) {
			gradient *= -1;
		}
		// Set the "speed" horizontally and vertically
		let ratioXY = bulletSpeed / (1 + gradient);
		let bulletSpeedY = ratioXY;
		let BulletSpeedX = ratioXY * gradient;
		// Point the bullet in the right direction
		if (toX < fromX) {
			BulletSpeedX *= -1;
		}
		if (toY < fromY) {
			bulletSpeedY *= -1;
		}
		this.inFlight = true;
		this.x = fromX;
		this.y = fromY;
		this.SpeedX = BulletSpeedX;
		this.SpeedY = bulletSpeedY;
	}
	update(dt) {
		if (this.inFlight) {
			this.x += this.SpeedX * dt;
			this.y += this.SpeedY * dt;
		}
		if (this.x < 0 || this.y < 0 || this.x > cvs.width || this.y > cvs.height) this.inFlight = false;
	}
	draw() {
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y, 5, 5);
		ctx.restore();
	}
}
class Enemy {
	constructor(ex, ey) {
		this.x = ex;
		this.y = ey;
		this.hp = 100;
	}
	update(dt) {
		if (this.hp > 0) {
			if (player.x > this.x) this.x += enemySpeed * dt;
			if (player.x < this.x) this.x -= enemySpeed * dt;
			if (player.y > this.y) this.y += enemySpeed * dt;
			if (player.y < this.y) this.y -= enemySpeed * dt;
		}
	}
	draw() {
		if (this.hp > 0) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(-Math.atan2(this.x - player.x, this.y - player.y) - Math.PI / 2);
			ctx.drawImage(bloater, -bloater.width / 2, -bloater.height / 2);
			ctx.restore();
			ctx.fillStyle = "red";
			ctx.fillRect(this.x - bloater.width / 2, this.y - bloater.height / 2, this.hp * 0.7, 2);
			ctx.restore();
		} else
			ctx.drawImage(blood, this.x - 37, this.y - 37);
	}
}

function fillBackground(color) {
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, cvs.width, cvs.height);
}

function drawCrosshair() {
	ctx.drawImage(crosshair, mouseX - 33, mouseY - 33);
}

function drawHP() {
	ctx.font = "20px Arial";
	ctx.fillText('hp ' + player.hp, 10, 20);
}

function getDistance(firstObdject, secondObject) {
	return Math.sqrt(Math.pow(firstObdject.x - secondObject.x, 2) + Math.pow(firstObdject.y - secondObject.y, 2))
}
let cvs = document.getElementById("canvas");
let ctx = cvs.getContext("2d");
ctx.canvas.width = window.innerWidth - 30;
ctx.canvas.height = window.innerHeight - 30;
const bulletSpeed = 1000;
const enemySpeed = 50;
let mouseX = 0;
let mouseY = 0;
let keys = [];
let bullets = [];
let enemies = [];
let player = new Player(cvs.width / 2, cvs.height / 2);
const bloater = new Image();
bloater.src = "graphic/bloater.png";
const crosshair = new Image();
crosshair.src = "graphic/crosshair.png";
const blood = new Image();
blood.src = "graphic/blood.png";
const playerimg = new Image();
playerimg.src = "graphic/player.png";

window.addEventListener('mousemove', (e) => {
	mouseX = e.pageX;
	mouseY = e.pageY;
})
window.addEventListener('keydown', (e) => keys[e.keyCode] = true)
window.addEventListener('keyup', (e) => keys[e.keyCode] = false)
window.addEventListener('click', () => bullets.push(new Bullet(player.x, player.y, mouseX, mouseY)))
//инициализируем врагов по контуру
for (let i = 0; i < 5; i++) {
	enemies.push(new Enemy(Math.random() * cvs.width, 0));
	enemies.push(new Enemy(0, Math.random() * cvs.height));
	enemies.push(new Enemy(Math.random() * cvs.width, cvs.height));
	enemies.push(new Enemy(cvs.width, Math.random() * cvs.height));
}

let lastTime;
const main = () => {
	//console.log(playerimg.width);
	fillBackground('grey');
	let now = Date.now();
	let dt = (now - lastTime) / 1000.0;
	if (isNaN(dt)) dt = 0; //костыль, первые несколько кадров dt=NaN и из-за этого ломается enemies.update()

	for (let i = 0; i < bullets.length; i++) {
		bullets[i].update(dt);
		bullets[i].draw();
	}
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update(dt);
		enemies[i].draw();
	}
	player.update(dt);
	player.draw();
	drawCrosshair();
	drawHP();
	//удаляем улетевшие пульки
	if (bullets[0] !== undefined && (!bullets[0].inFlight || isNaN(bullets[0].SpeedX) || isNaN(bullets[0].SpeedY)))
		bullets.shift();

	for (let j = 0; j < enemies.length; j++) {
		if (getDistance(player, enemies[j]) < 75 && enemies[j].hp > 0) {
			player.hp--;
		}
		for (let i = 0; i < bullets.length; i++) {
			if (getDistance(bullets[i], enemies[j]) < 50 && bullets[i].inFlight && enemies[j].hp > 0) {
				enemies[j].hp -= 35;
				bullets[i].inFlight = false;
			}
		}
	}
	if (player.hp <= 0)
		location.reload(alert("game over"));
	lastTime = now;
	requestAnimationFrame(main);
}
playerimg.onload = main;