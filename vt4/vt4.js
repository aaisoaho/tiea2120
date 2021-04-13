// VT4
"use strict";
/* GLOBAALIT MUUTTUJAT
* -------------------------------------------------------------------
*	oikeaan		=	Lähetetäänkö pöllö oikeaan vai vasempaan?
*	gradientNro	=	Monesko gradient kyseessä - käytetään, jotta 
*					saadaan uniikit ID:t
*/
let oikeaan = true;
let gradientNro	= 1;

/* window.onload
* -------------------------------------------------------------------
*	Animoitu verkkosivu, jossa liikkuu palkkeja, pöllöjä, tekstiä
*	ja jäniksen puolikkaat
*/
window.onload = function() {
	/*
		Luodaan N määrä palkkeja, jotka rullaavat taustalla.
	*/
	for (let i = 0; i < 20; i++) {
		let palkki = luo_palkki_elementti("150px");
		let anim_spd = "";
		if (i>=10) {
			anim_spd = Math.floor(i/10) + "." + i%10 + "s";
		} else {
			anim_spd = "." + i + "s";
		}
		palkki.style.animationDelay = anim_spd;
	}
	// Luodaan pupun puolikkaiden canvakset
	let pupu_vasen  = document.createElement("canvas");
	pupu_vasen.setAttribute("class","bunny_left");
	pupu_vasen.setAttribute("width","192");
	document.getElementsByTagName("body")[0].appendChild(pupu_vasen);
	let pupu_oikea  = document.createElement("canvas");
	pupu_oikea.setAttribute("class","bunny_right");
	pupu_oikea.setAttribute("width","192");
	document.getElementsByTagName("body")[0].appendChild(pupu_oikea);
	// Lisätään aaltoiluanimaatio canvaksiin.
	aallota_kuva(pupu_vasen,'bunny.png',0);
	aallota_kuva(pupu_oikea,'bunny.png',1);
	// Piirretään scrollaava teksti.
	piirra_teksti("TIEA212 Web-käyttöliittymien ohjelmointi -kurssin viikkotehtävä 4 taso 3 edellyttää tämännäköistä sivua");
	
	// Lisätään napille toiminto
	document.getElementById("lisaaPollo").addEventListener("click",function(e) {
		e.preventDefault();
		
		luo_pollo(oikeaan,Math.floor(Math.random()*7));
		oikeaan = !oikeaan;
	});
	// Luodaan vielä ensimmäinen poukkoileva pöllö
	luo_pollo(false,0);
}

/* function piirra_teksti(teksti)
* -------------------------------------------------------------------
*	Piirtää annetun tekstin ja animoi sen scrollaamaan näytön halki.
*	Teksti on liukuvärjätty.
* -------------------------------------------------------------------
*	teksti	=	Teksti joka piirretään näytölle
* -------------------------------------------------------------------
*/
function piirra_teksti(teksti) {
	// Luodaan canvas, asetetaan sille koko ja haetaan sen context
	let canvas = document.createElement("canvas");
	canvas.setAttribute("width","1200");
	canvas.setAttribute("height","130");
	canvas.setAttribute("class","tekstiloota");
	let ctx = canvas.getContext('2d');
	// Luodaan gradientti
	let gradient = ctx.createLinearGradient(0,0,0,130);
	gradient.addColorStop(0,"rgb(0,0,0)");
	gradient.addColorStop(0.5,"rgb(255,255,0)");
	gradient.addColorStop(1,"rgb(0,0,0)");
	// Määritellään teksti ja täyttö
	ctx.font = "100px arial";
	ctx.fillStyle = gradient;
	// XX on muuttuja, jota kasvatetaan joka piirron yhteydessä -> SCROLL
	let xx = 0;
	// Initissä ei tarvitse tehdä muuta kuin kutsua ensimmäinen draw.
	function init() {
		window.requestAnimationFrame(draw);
	}
	function draw() {
		// Tyhjennetään jottei tule ns. häntimistä
		ctx.clearRect(0,0,1200,300);
		ctx.save();
		// Piirretään teksti uuteen paikkaan
		ctx.fillText(teksti,1200 - xx,100);
		// Kasvatetaan XX, jos XX menee yli annetun, nollataan se.
		xx += 1;
		if (xx > 56*teksti.length) xx = 0;
		ctx.restore();
		// Uudestaan.
		window.requestAnimationFrame(draw);
	}
	init();
	// Lisätään canvas bodyelementin loppuun
	document.getElementsByTagName("body")[0].appendChild(canvas);
}
/* function aallota_kuva(canvas,kuva,LoR)
* -------------------------------------------------------------------
*	Luodaan pupukuvasta puolet oleva canvas ja lisätään siihen
*	aaltoliikettä.
* -------------------------------------------------------------------
*	canvas	=	canvas jolle piirretään
*	kuva	=	Kuva jota käsitellään
*	LoR		=	Vasen (LoR=0) vai oikea (LoR=1), Left Or Right
*/
function aallota_kuva(canvas,kuva,LoR) {
	// Asetetaan canvakselle korkeus ja luodaan uusi kuva
	let kuvaOrig = new Image();
	canvas.setAttribute("height","1200");
	
	function init() {
		// Asetetaan kuvaksi parametrina tuotu URL
		kuvaOrig.src = kuva;
		window.requestAnimationFrame(draw);
	}
	function draw() {
		let ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,192,1200);
		
		ctx.save();
		// Haetaan tämä päivä
		let time = new Date();
		// Pidetään kirjaa kuinka korkea rakennettu kuva on jo
		let canv_y = 0;
		// Haetaan millisekunnit jotta saadaan sulava animaatio
		let ms = time.getMilliseconds();
		// Muodostetaan jänis osista, HUOM: mitä enemmän osaLKM niin sitä pienemmät osat ovat (hienovaraisempaa liikettä), mutta sitä raskaampaa ohjelman pyörittäminen on
		let osaLKM = 10;
		let osakoko = 600/osaLKM;
		for (let i = 0; i < osaLKM; i++) {
			// Muutetaan millisekuntteja asteiksi
			// kun MS mahdollisen luvut ovat 0 - 1000
			// niin kerrotaan 360 MS/1000 jolloin millisekunnit
			// antavat meille luvun väliltä 0 - 360
			let asteet_ms = 360*(ms/1000) ;
			// sitten sinillä haetaan aaltoilua, periaatteessa i ja ms vaikuttavat nyt yhtä paljon
			let sinikerroin = Math.sin( degToRad(i*36+asteet_ms) );
			// Lopuksi vielä standardoidaan asteet minimeillä ja maksimeilla, nyt MIN: 120, MAX: 160
			let incr = tasaa_kertoimella(sinikerroin,2*osakoko,osakoko*7/3);
			// Tämä piirtää palasen kuvasta kankaalle sopivaan korkeuteen.
			ctx.drawImage(kuvaOrig,(192*LoR),osakoko*(i),192,osakoko,0,canv_y,192,incr);
			canv_y += incr;
		}
		ctx.restore();
		window.requestAnimationFrame(draw);
	}
	init();
}

/* function pilko_kuva_canvakselle(kuva,vaaka,pysty,x,y)
* -------------------------------------------------------------------
*	Pilkkoo annetusta kuvasta halutun kokoisen osan ja laittaa sen
*	canvakselle, jonka sitten palauttaa käyttäjälle.
* -------------------------------------------------------------------
*	kuva	=	Pilkottavan kuvan URL
*	vaaka	=	Kuinka leveä palanen onLine
*	pysty	=	Kuinka korkea palanen onLine
*	x		=	Mistä X:stä aletaan leikkaamaan palaa
*	y		=	Mistä Y:stä aletaan leikkaamaan palaa
*	return	=	Canvas jolle on sijoitettu pala alkuperäisestä kuvasta
*/
function pilko_kuva_canvakselle(kuva,vaaka,pysty,x,y) {
	// HUOM: Tätä funktiota tarvittiin vain taso 1
	let canvas = document.createElement("canvas");
	canvas.setAttribute("height",pysty);
	canvas.setAttribute("width",vaaka);
	let ctx = canvas.getContext('2d');
	
	let img = new Image();
	img.addEventListener('load', function () {
		ctx.drawImage(img,x,y,vaaka,pysty,0,0,vaaka,pysty);
	});
	img.src = kuva;
	
	return canvas;
}

/* function luo_pollo(alt, timing)
* -------------------------------------------------------------------
*	Luo pöllön ja asettaa sille halutun suunnan sekä liikkumistavan
* -------------------------------------------------------------------
*	alt		=	Liikutaanko "väärään" suuntaan
*	timing	=	animationTimingFunction, {
*					0 = linear,
*					1 = ease,
*						...
*					6 = step-end
*					defaultina ottaa initial
*				}
*	return	=	IMG elementin viite
*/
function luo_pollo(alt, timing) {
	// Luodaan kuvaelementti ja löydään siihen pöllö
	let img = document.createElement('img');
	img.src = 'owl.svg';
	img.alt = 'Pöllö';
	img.setAttribute("class","pollo");
	// Jos tarvitsee "väärään" suuntaan kulkevan pöllön niin määritellään sille animationDirection
	if (alt)
		img.style.animationDirection = "reverse";
	// Katsotaan vielä pyydetty timing pöllölle
	switch(timing) {
		case 0:
			img.style.animationTimingFunction = "linear";
			break;
		case 1:
			img.style.animationTimingFunction = "ease";
			break;
		case 2:
			img.style.animationTimingFunction = "ease-in";
			break;
		case 3:
			img.style.animationTimingFunction = "ease-out";
			break;
		case 4:
			img.style.animationTimingFunction = "ease-in-out";
			break;
		case 5:
			img.style.animationTimingFunction = "step-start";
			break;
		case 6:
			img.style.animationTimingFunction = "step-end";
			break;
		default:
			img.style.animationTimingFunction = "initial";
			break;
	}
	// Lisätään pöllö bodyyn ja palautetaan elementin viite
	document.getElementsByTagName("body")[0].appendChild(img);
	return img;
}

/* function luo_palkki_elementti(korkeus)
* -------------------------------------------------------------------
*	Luo määrätyn korkuisen palkin. Palkki on SVG.
* -------------------------------------------------------------------
*	korkeus	=	Kuinka korkea palkki luodaan
*	return	=	Palkin SVG-elementin viite
*/
function luo_palkki_elementti(korkeus) {
	// Luodaan SVG elementtimme määritelmät
	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width","100%");
	svg.setAttribute("height",korkeus);
	svg.setAttribute("version","1.1");
	svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
	svg.setAttribute("class","palkki");
	
	// Luodaan definet
	// linearGradient
	let def = document.createElementNS("http://www.w3.org/2000/svg", "defs");
	let linGrad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
	linGrad.setAttribute("id","Gradient"+gradientNro);
	linGrad.setAttribute("x1","0");
	linGrad.setAttribute("x2","0");
	linGrad.setAttribute("y1","0");
	linGrad.setAttribute("y2","1");
	
	let stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
	stop.setAttribute("offset","0%");
	stop.setAttribute("stop-color","black");
	linGrad.appendChild(stop);
	stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
	stop.setAttribute("offset","50%");
	stop.setAttribute("stop-color","yellow");
	linGrad.appendChild(stop);
	stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
	stop.setAttribute("offset","100%");
	stop.setAttribute("stop-color","black");
	linGrad.appendChild(stop);
	
	def.appendChild(linGrad);
	svg.appendChild(def);
	// Luodaan rectangle
	let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute("x","0");
	rect.setAttribute("y","0");
	rect.setAttribute("width","100%");
	rect.setAttribute("height",korkeus);
	rect.setAttribute("fill","url(#Gradient"+gradientNro+")");
	svg.appendChild(rect);
	
	document.getElementsByTagName("body")[0].appendChild(svg);
	gradientNro++;
	return svg;
}

/* function degToRad(deg)
* -------------------------------------------------------------------
*	Muuttaa asteet radiaaneiksi.
* -------------------------------------------------------------------
*	deg		=	Asteet
*	return	=	Asteet radiaaneina
*/
function degToRad(deg) {
	return (deg * Math.PI/180);
}

/* tasaa_kertoimella(kerroin,minimi,maksimi)
* -------------------------------------------------------------------
*	Muuttaa luvun, jota kerrotaan jollain kertoimella, välille 
*	Minimi - Maksimi
* -------------------------------------------------------------------
*	kerroin	=	Kerroin joka halutaan välille min-max (esim. Random)
*	minimi	=	Minimiarvo
*	maksimi	=	Maksimiarvo
*	return	=	Luku, joka on väliltä min-max
*/
function tasaa_kertoimella(kerroin,minimi,maksimi) {
	return Math.floor(kerroin * (maksimi - minimi)) + minimi;
}