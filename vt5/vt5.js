"use strict";
console.log(data);

/*	GLOBAALIT MUUTTUJAT
* -------------------------------------------------------------------
*	joukkueiden_rastit		=	Tietorakenne, jossa ylhäällä jid ja polyline
*	kartta					=	Kartta jolle piirretään (Leaflet-kartta)
*	raah_tyyppi				=	Minkä tyyppistä elementtiä raahataan
*	klikattu				=	Mitä circleä on klikattu
*	raah_mark				=	Mitä markeria on klikattu (TASO 3)
*/
let joukkueiden_rastit = [];
let kartta;
let raah_tyyppi;
let klikattu = undefined;
let raah_mark = undefined;

window.onload = function() {
	// Kartalle koko + luodaan itse kartta, sekä lisätään siihen rastit ja lisätään vielä joukkueet diveihin.
	maaraa_koot();
	luo_kartta();
	luo_rastit();
	luo_joukkueet();
	
	// EventListenerit "Kartalla"-osioon lisäämiseen
	let karttaan = document.getElementById("kartalla").getElementsByTagName("ul")[0];
	karttaan.addEventListener("dragover", function(e) {
		e.preventDefault();
		// Set the dropEffect to move
		e.dataTransfer.dropEffect = "move"
	});

	karttaan.addEventListener("drop", function(e) {
		e.preventDefault();
		if (raah_tyyppi === "joukkue") { // Minkä tyyppistä elementtiä raahataan?
			var data = e.dataTransfer.getData("text");
			// lisätään tämän elementin sisään
			for (let i = 0; i < joukkueiden_rastit.length; i++) {
				// Haetaan oikea polyline, poistetaan se (jos raahataan kartalla -> kartalla) ja lisätään uudestaan.
				if (joukkueiden_rastit[i].id.toString() === data.toString()) {
					kartta.removeLayer(joukkueiden_rastit[i].pl);
					kartta.addLayer(joukkueiden_rastit[i].pl);
				}
			}
			karttaan.prepend(document.getElementById(data));
		}
	});
	
	// eventListenerit "Joukkueet"-osioon lisäämiseen
	let muut = document.getElementById("loput").getElementsByTagName("ul")[0];
	muut.addEventListener("dragover", function(e) {
		e.preventDefault();
		// Set the dropEffect to move
		e.dataTransfer.dropEffect = "move"
	});

	muut.addEventListener("drop", function(e) {
		e.preventDefault();
		if (raah_tyyppi === "joukkue") { // Onko oikeaa tyyppiä?
			var data = e.dataTransfer.getData("text");
			// lisätään tämän elementin sisään
			for (let i = 0; i < joukkueiden_rastit.length; i++) {
				// Haetaan polyline ja poistetaan se kartalta.
				if (joukkueiden_rastit[i].id.toString() === data.toString())
					kartta.removeLayer(joukkueiden_rastit[i].pl);
			}
			muut.prepend(document.getElementById(data));
		}
	});
}
//Seurataan ikkunan koon muutoksia, sillä sen mukaan täytyy muuttaa muiden elementtien kokoja
$( window ).resize(function () {
	maaraa_koot();
});

/*	function hae_rasti(rid)
* -------------------------------------------------------------------
*	Hakee tietorakenteesta halutun rastin rasti-ID:n avulla
* -------------------------------------------------------------------
*	rid	=		haettavan rastin ID
*	return		Palauttaa rasti-objektin tai undefined (jos ei löytynyt)
*/
function hae_rasti(rid) {
	for (let i = 0; i < data.rastit.length; i++) {
		if (data.rastit[i].id.toString() === rid.toString()) {
			return data.rastit[i];
		}
	}
	return undefined;
}

/*	function luo_joukkueet()
* -------------------------------------------------------------------
*	Luo joukkueet LI-elementeiksi listoille.
*/
function luo_joukkueet() {
	// m_ul on UL elementti joka lisätään div#loput -elementtiin.
	let m_ul = document.createElement("ul");
	for(let i = 0; i < data.joukkueet.length; i++) {
		// Järjestetään rastit aikajärjestykseen.
		data.joukkueet[i].rastit.sort(function(a, b) {
			var aikaA = a.a; 
			var aikaB = b.a;
			if (aikaA < aikaB) {
				return 1;
			}
			if (aikaA > aikaB) {
				return -1;
			}
			return 0;
		});
		
		let rastiviiva = [];
		let matka = 0;
		let sis_ul = document.createElement("ul"); //sis_ul on UL-elementti joka sijoitetaan joukkueen details-elementtiin
		// Käydään joukkueen leimaukset läpi
		for (let j = 0; j < data.joukkueet[i].rastit.length; j++) {
			// Luodaan LI-elementti leimaukselle
			let sis_li = document.createElement("li");
			sis_li.setAttribute("id",hae_rasti(data.joukkueet[i].rastit[j].id).id);
			sis_li.appendChild(document.createTextNode(hae_rasti(data.joukkueet[i].rastit[j].id).koodi));
			sis_ul.appendChild(sis_li);
			// Kyseessä on raahattava.
			sis_li.setAttribute("draggable","true");
			sis_li.addEventListener("dragstart", function(e) {
				// raah_tyypillä tietää, mitä elementtiä ollaan raahaamassa
				raah_tyyppi = "r_"+i;
				e.dataTransfer.setData("text/plain",sis_li.getAttribute("id"));
			});
			sis_li.addEventListener("dragover", function(e) {
				e.preventDefault();
				// Set the dropEffect to move
				e.dataTransfer.dropEffect = "move"
			});
			sis_li.addEventListener("drop", function(e) {
				e.preventDefault();
				if (raah_tyyppi === "r_"+i) { // Jos ollaan raahaamassa samantyyppiseen LI-elementtiin
					var data = e.dataTransfer.getData("text");
					// lisätään ennen tätä elementtiä
					sis_ul.insertBefore(document.getElementById(data),this);
					// Joukkueen reitti muuttui, joten käydään muuttamassa tietoja.
					jarjesta_rastiviiva_uusiksi(sis_ul.parentElement.parentElement.getAttribute("id"),sis_ul);
				}
			});
			// Lisätään rasti kordinaattilistalle
			rastiviiva.push([parseFloat(hae_rasti(data.joukkueet[i].rastit[j].id).lat),parseFloat(hae_rasti(data.joukkueet[i].rastit[j].id).lon)]);
			// Lasketaan matka.
			if (j-1>=0)
				matka += getDistanceFromLatLonInKm(	parseFloat(hae_rasti(data.joukkueet[i].rastit[j].id).lat),parseFloat(hae_rasti(data.joukkueet[i].rastit[j].id).lon),
													parseFloat(hae_rasti(data.joukkueet[i].rastit[j-1].id).lat),parseFloat(hae_rasti(data.joukkueet[i].rastit[j-1].id).lon));
		}
		// Luodaan viiva.
		let polyline = L.polyline(rastiviiva, {color: rainbow(data.joukkueet.length, i)});
		// Lisätään viiva lokaaliin tietorakenteeseen
		joukkueiden_rastit.push({
			pl: polyline, 
			id: data.joukkueet[i].id
			});
		// Pyöristetään matka 0.1 tarkkuuteen
		matka = Math.round(matka * 10)/10;
		// Luodaan joukkueen LI-elementti, details ja summary -elementit
		let li = document.createElement("li");
		let summary  = document.createElement("summary");
		let dets = document.createElement("details");
		summary.appendChild(document.createTextNode(data.joukkueet[i].nimi + " ( " + matka + " km )"));
		dets.appendChild(summary);
		dets.appendChild(sis_ul);
		li.setAttribute("id",data.joukkueet[i].id);
		li.appendChild(dets);
		li.style.backgroundColor = rainbow(data.joukkueet.length, i);
		summary.setAttribute("draggable", "true");
		summary.setAttribute("class","joukkue");
		summary.addEventListener("dragstart", function(e) {
			// raahataan datana elementin id-attribuutin arvo
			raah_tyyppi = "joukkue";
			e.dataTransfer.setData("text/plain", li.getAttribute("id"));
		});
		m_ul.append(li);
	}
	$("#loput").append(m_ul);
}

/*	function jarjesta_rastiviiva_uusiksi(jid,elem_ul)
* -------------------------------------------------------------------
*	Järjestää joukkueen kulkeman viivan uusiksi ja laskee uuden 
*	kuljetun matkan.
* -------------------------------------------------------------------
*	jid		=	joukkueen ID
*	elem_ul	=	Mistä löytyy joukkueen rastit sisältävä UL-elementti
*/
function jarjesta_rastiviiva_uusiksi(jid,elem_ul) {
	// main_div kertoo, onko kyseessä Kartalla-lista vai Loput-lista
	let main_div = elem_ul.parentElement.parentElement.parentElement.parentElement.getAttribute("id");
	// lit eli LI-elementit
	let lit = elem_ul.children;
	let uusiviiva = [];
	let matka = 0;
	// Haetaan tietorakenteesta sen joukkueen tauluindeksi, josta on kyse
	let j_int = 0;
	for (let i = 0; i < data.joukkueet.length; i++) {
		if (data.joukkueet[i].id.toString() === jid.toString()) {
			j_int = i;
		}
	}
	// Käydään LI-elementit läpi ja katsotaan, missä joukkueen rastit sijaitsee ja koostetaan kordinaattilista
	for (let i = 0; i < lit.length; i++) {
		for (let j = 0; j < data.joukkueet[j_int].rastit.length; j++) {
			if (hae_rasti(data.joukkueet[j_int].rastit[j].id).id.toString() === lit[i].getAttribute("id").toString()) {
				uusiviiva.push([parseFloat(hae_rasti(data.joukkueet[j_int].rastit[j].id).lat),parseFloat(hae_rasti(data.joukkueet[j_int].rastit[j].id).lon)]);
			}
		}
	}
	// Lasketaan kordinaattilistalta joukkueen kulkema matka
	for (let i = 1; i < uusiviiva.length; i++) {
		matka += getDistanceFromLatLonInKm(uusiviiva[i-1][0],uusiviiva[i-1][1],uusiviiva[i][0], uusiviiva[i][1]);
	}
	// Haetaan skriptiin luodusta tietorakenteesta oikea objekti
	for (let i = 0; i < joukkueiden_rastit.length; i++) {
		if (joukkueiden_rastit[i].id.toString() === jid.toString()) {
			// Luodaan kordinaattilistan perusteella uusi viiva ja poistetaan viiva kartalta
			let polyline = L.polyline(uusiviiva, {color: rainbow(data.joukkueet.length, i)});
			if (main_div.toString() === "kartalla") {
				kartta.removeLayer(joukkueiden_rastit[i].pl);
			}
			// Lisätään haettuun objektiin uusi viiva ja lisätään se kartalle
			joukkueiden_rastit[i].pl = polyline;
			if (main_div.toString() === "kartalla") {
				kartta.addLayer(joukkueiden_rastit[i].pl);
			}
			// Pyöristetään matka 0.1 tarkkuuteen ja muutetaan summaryssa oleva teksti
			matka = Math.round(matka * 10)/10;
			elem_ul.parentElement.getElementsByTagName("summary")[0].textContent = data.joukkueet[i].nimi + " ( " + matka + " km )";
		}
	}
}

/* function luo_rastit()
* -------------------------------------------------------------------
*	Luodaan kaikki tietorakenteessa olevat rastit kartalle
*/
function luo_rastit() {
	for (let i = 0; i < data.rastit.length; i++) {
		// Luodaan rasti tietorakenteesta löytyvillä tiedoilla
		let circle = L.circle(
		[parseFloat(data.rastit[i].lat), parseFloat(data.rastit[i].lon)], {
			color: 'red',
			opacity: 0.5,
			fillColor: '#f03',
			fillOpacity: 0,
			radius: 75
		});
		// Asetetaan rastille erityistietoina ID ja lappu ("label")
		circle.id = data.rastit[i].id;
		let divIcon = L.divIcon({
			className: "rastiKoodit",
			html: data.rastit[i].koodi
		});
		// Tässä kannattaa huomata se, että 0.2 tarkoittaa 200 metriä (0.2km/6378km)
		circle.lappu = L.marker(new L.LatLng(parseFloat(data.rastit[i].lat)+ (0.2/6378)*(180/Math.PI), parseFloat(data.rastit[i].lon)), {icon: divIcon}).addTo(kartta);
		
		//TASO 3 vaatima raahaus kommentoituna pois.
		//circle.on("click", klikkaa_rastia);
		
		// Tässä tapahtuu raahauksen toiminnot.
		circle.on({
			mousedown: function (e) { 
				klikattu = e.target;
				// Kartan ei kuulu raahautua silloin, kun ympyrää raahataan.
				kartta.dragging.disable();
				kartta.on('mousemove',function (e) {
					// Hiiren liikkuessa asetetaan circle ja circlen lappu uuteen hiiren näyttämään paikkaan
					circle.setLatLng(e.latlng);
					circle.lappu.setLatLng(new L.LatLng(e.latlng.lat+ (0.2/6378)*(180/Math.PI), e.latlng.lng));
				});
			}
		});
		kartta.on('mouseup', function () {
			// Jos hiirestä päästetään irti, niin katsotaan oliko meillä klikattua
			if (klikattu !== undefined) {
				// Jos oli niin muutetaan kaikki ne tiedot, jotka tarvitsivat klikatun tietoja
				muuta_kaikki(klikattu.getLatLng(),klikattu.id);
				// Ilmoitetaan vielä, ettei ollut mitään klikattuna.
				klikattu = undefined; 
			}
			// Annetaan taas kartan raahautua.
			kartta.dragging.enable();
			// Hiiren liikkeitä ei tarvitse enää kuunnella.
			kartta.removeEventListener('mousemove');
		});
		circle.addTo(kartta);
	}
}

/* function klikkaa_rastia(e)
* -------------------------------------------------------------------
*	TASO 3 mukainen marker-pohjainen raahausfunktio. 
*	En kokenut olennaiseksi kommentoida tätä pois kokonaan.
*/
function klikkaa_rastia(e) {
	klikattu = e.target;
	let pos = klikattu.getLatLng();
	if (raah_mark !== undefined) {
		kartta.removeLayer(raah_mark);
	}
	raah_mark = L.marker([pos.lat,pos.lng], {draggable:'true'})
	raah_mark.on('dragend', function(e) {
		let pos = raah_mark.getLatLng();
		raah_mark.setLatLng(new L.LatLng(pos.lat, pos.lng),{draggable:'true'});
		klikattu.setLatLng(new L.LatLng(pos.lat, pos.lng));
		muuta_kaikki(pos, klikattu.id);
	});
	kartta.addLayer(raah_mark);
}

/* function muuta_kaikki(pos,rid)
* -------------------------------------------------------------------
*	Muuttaa kaikkien tiedot, joihin muutos vaikuttaa.
* -------------------------------------------------------------------
*	pos	=	Uusi sijainti
*	rid	=	Muuttuneen rastin ID
* -------------------------------------------------------------------
*/
function muuta_kaikki(pos,rid) {
	// Etsitään rasti ja muutetaan sen lat ja lon vastaamaan uutta lat,lon
	for (let i = 0; i < data.rastit.length; i++) {
		if (data.rastit[i].id.toString() === rid.toString()) {
			data.rastit[i].lat = pos.lat;
			data.rastit[i].lon = pos.lng;
		}
	}
	// Katsotaan kaikki joukkueet ja tarkastellaan, onko joukkueen tiedot muuttuneet
	for (let i = 0; i < data.joukkueet.length; i++) {
		let muuttunut = false;
		// Käydään läpi ja katsotaan onko joukkue käynyt muuttuneella rastilla.
		for (let j = 0; j < data.joukkueet[i].rastit.length; j++) {
			if (data.joukkueet[i].rastit[j].id.toString() === rid.toString()) {
				muuttunut = true;
			}
		}
		// Jos joukkue on käynyt muuttuneella rastilla, lasketaan kaikki uusiksi.
		if (muuttunut) {
			let sis_ul = document.getElementById(data.joukkueet[i].id).getElementsByTagName("ul")[0];
			jarjesta_rastiviiva_uusiksi(data.joukkueet[i].id,sis_ul);
		}
	}
}

/* function luo_kartta()
* -------------------------------------------------------------------
*	Luo kartan käyttäen Leaflet:ia.
*/
function luo_kartta() {
	// Lasketaan kartan keskipiste
	let keskilat = 0, keskilon = 0;
	for (let i = 0; i < data.rastit.length; i++) {
		keskilat+=parseFloat(data.rastit[i].lat);
		keskilon+=parseFloat(data.rastit[i].lon);
	}
	keskilat = keskilat / data.rastit.length;
	keskilon = keskilon / data.rastit.length;
	
	// Luodaan kartta ja asetetaan keskipisteeksi äsken laskettu, zoomaustasolla 9 näkyy kaikki
	// HUOM. En keksinyt kuinka sopivan zoomaustason saisi laskettua.
	kartta = new L.map('map', {
		crs: L.TileLayer.MML.get3067Proj()
	}).setView([keskilat, keskilon], 9);
	// Haetaan vielä tileLayer kartalle.
	L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(kartta);
}

/*	function maaraa_koot()
* -------------------------------------------------------------------
*	Määrittää kartan koon mukautumaan ikkunan sen hetkiseen kokoon.
*/
function maaraa_koot() {
	let div = $("#map");
	let height = Math.floor(window.innerHeight);
	let width = Math.floor(document.body.clientWidth/2);
	div.css("width", width + "px");
	div.css("height", height + "px");
	div = $("#listat");
	div.css("width", width + "px");
	div.css("height", height + "px");
}


/*	getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2)
---------------------------------------------------------------------
	Laskee 2 pisteen välimatkan kilometreinä
---------------------------------------------------------------------
	lat1 = Ensimmäisen pisteen Latitude
	lon1 = Ensimmäisen pisteen Longitude
	lat2 = Toisen pisteen Latitude
	lon2 = Toisen pisteen Longitude
*/
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}


/*	deg2rad(deg)
---------------------------------------------------------------------
	Muuttaa annetun asteen radiaaneiksi.
*/
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}