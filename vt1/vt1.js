// Whole-script strict mode syntax
"use strict";

/*	tulostaNimet()
---------------------------------------------------------------------
	Funktio tulostaa konsoliin (console.log) data-tietorakenteen 
	sisältämien joukkueiden nimet. Jokainen nimi tulostetaan omalle
	rivilleen.
*/
function tulostaNimet() {
	//alustetaan muuttuja ensimmäisellä joukkuenimellä, jonka jälkeen
	//käydään läpi kaikki loput joukkueiden nimet.
	let nimilista = data.joukkueet[0].nimi;
	for (var i = 1; i < data.joukkueet.length; i++)
		nimilista = nimilista + "\n" + data.joukkueet[i].nimi;
	console.log(nimilista);
};

/*	tulostaNimetJaPisteet()
---------------------------------------------------------------------
	Tulostaa nimet ja pisteet, järjestettynä joukkuenimien mukaiseen 
	aakkosjärjestykseen.
*/
function tulostaNimetJaPisteet() {
	//Kerätään joukkueet arrayksi erillisellä funktiolla.
	//Funktio on tehty sitä varten, että samankaltaista funktiota 
	//tarvittiin niin taso 3 kuin taso 5. 
	var joukkueet = keraaPisteet();
	
	//Lajitellaan joukkueet nimen mukaiseen aakkosjärjestykseen.
	joukkueet.sort(function(a, b) {
		//Muutetaan uppercaseksi, jotta vertailu olisi helpompaa.
		var nimiA = a.nimi.toUpperCase(); 
		var nimiB = b.nimi.toUpperCase();
		if (nimiA < nimiB) {
			return -1;
		}
		if (nimiA > nimiB) {
			return 1;
		}
		return 0;
	});
	/*
		Lopuksi tulostetaan joukkueen nimet ja pisteet
	*/
	for (var i = 0; i < joukkueet.length; i++) {
		console.log(joukkueet[i].nimi + ": " + joukkueet[i].pisteet);
	}
};


/*	tulostaTaso5()
---------------------------------------------------------------------
	Tulostaa nimet ja pisteet, järjestettynä joukkuenimien mukaiseen 
	aakkosjärjestykseen.
*/
function tulostaTaso5() {
	//Kerätään joukkueet arrayksi erillisellä funktiolla.
	var joukkueet = keraaPisteet();
	
	//Järjestetään joukkueet pisteiden mukaan.
	joukkueet.sort(function(a, b) {
		if (a.pisteet > b.pisteet) {
			return -1;
		}
		if (a.pisteet < b.pisteet) {
			return 1;
		}
		return 0;
	});
	
	/*
		Lopuksi tulostetaan vaaditut tiedot.
	*/
	for (var i = 0; i < joukkueet.length; i++) {
		var joukkueen_aika = new Date
		console.log(joukkueet[i].nimi 
					+ " - Pisteet: "+ joukkueet[i].pisteet 
					+ ", Matka: " + joukkueet[i].matka
					+ ", Aika: " + ms2Time(joukkueet[i].aika)); //ms2Time muuttaa annetut millisekunnit hh:mm:ss -muotoon.
	}
};

/*	keraaPisteet()
---------------------------------------------------------------------
	Kerää tupa-tietueesta joukkueiden nimet, pisteet, kuljetun matkan
	ja käytetyn ajan palautettavaan arrayhyn. 
	
	Array on muotoa: 
	[j1,j2,...,jN], jossa
	jN = {
		id: joukkueen_id,
		nimi: joukkueen_nimi,
		pisteet: joukkueen_pisteet,
		matka: joukkueen_matka
	}
*/
function keraaPisteet() {
	var joukkueet = new Array();
	/*
		Kerätään ensiksi kaikki tupa -tietorakenteessa olevat joukkueet
		ja niiden nimet ylös ja asetetaan KO. joukkueen pisteet nollaksi.
	*/
	var c = 1; 
	//Loopin toiminta: kaikille tupa -tietueessa ilmoitetuille joukkueille etsitään pari data.joukkueet.
	//Alustetaan joukkueet -array näillä joukkueen tiedoilla, eli kerätään nimi (ja id)
	Object.values(tupa.joukkueen_id).forEach(function(id) {
		for (var i = 0; i < data.joukkueet.length; i++) {
			if (data.joukkueet[i].id === id) {
				joukkueet.push({
					id: c,
					nimi: data.joukkueet[i].nimi,
					pisteet: 0,
					matka: 0,
					aika: 0
				});
			}
		}
		c++;
	});
	
	//Otetaan map-rakenteeseen rastin_id jotta sitä olisi helpompi käsitellä.
	var rastiMap = new Map(Object.entries(tupa.rastin_id));
	for (var i = 0; i < joukkueet.length; i++) {
		//Kerätään ylös joukkueen käymät rastit.
		var rastiArray = [];
		for (var j = 0; j < tupa.tupa.length; j++) {
			if (tupa.tupa[j].j == joukkueet[i].id) {
				rastiArray.push(tupa.tupa[j]);
			}
		}
		//Lajitellaan käydyt rastit ajan mukaan, siten että uusin rasti on viimeisenä.
		rastiArray.sort(function(a,b) {
			if (a.a < b.a) {
				return -1;
			}
			if (a.a > b.a) {
				return 1;
			}
			return 0;
		});
		
		var ensimmainenAika = ""; //Muuttujan tarkoitus on löytää ensimmäinen aika-leima
		var edellinenRasti = undefined;  //Muuttujaan tallennetaan edellinen käyty rasti
		var tamaRasti = undefined; //Muuttujaan tallennetaan tämänhetkinen rasti.
		for (var j = 0; j < rastiArray.length; j++) {
			//Tarkistetaan onko rastin aikaleima muuta kuin "" ja sitten tallennetaan se jos jotain muuta ei ole tallennettu
			if (rastiArray[j].a !="" && ensimmainenAika == "") {
				ensimmainenAika = rastiArray[j].a;
			}
			//Etsitään rastimerkintää vastaava rasti, jotta voidaan käsitellä sen tietoja
			for (var k = 0; k < data.rastit.length; k++) {
				if (data.rastit[k].id == rastiMap.get(rastiArray[j].r)) {
					tamaRasti = data.rastit[k];
					break;
				}
			}
			//Jos löytyi rasti, niin tarkistetaan rastin alkumerkki, jolla annetaan pisteet.
			//Toinen vaihtoehtoinen tapa olisi try catch, jossa yritetään parseInt. NaN tilanteissa 
			//hylätään yritys.
			//Päädyin switch-caseen, sillä switch-casella voidaan ottaa huomioon kaikkea mahdollista. mm. rastit jotka alkavatkin vaikka A-merkillä.
			if (tamaRasti != undefined) {
				var alkumerkki = tamaRasti.koodi[0];
				switch(alkumerkki) {
					case '1':
						joukkueet[i].pisteet += 1;
						break;
					case '2':
						joukkueet[i].pisteet += 2;
						break;
					case '3':
						joukkueet[i].pisteet += 3;
						break;
					case '4':
						joukkueet[i].pisteet += 4;
						break;
					case '5':
						joukkueet[i].pisteet += 5;
						break;
					case '6':
						joukkueet[i].pisteet += 6;
						break;
					case '7':
						joukkueet[i].pisteet += 7;
						break;
					case '8':
						joukkueet[i].pisteet += 8;
						break;
					case '9':
						joukkueet[i].pisteet += 9;
						break;
				}
				//Jos edellinen rasti on tiedossa, niin voidaan laskea etäisyys.
				if (edellinenRasti != undefined) {
					joukkueet[i].matka += getDistanceFromLatLonInKm(edellinenRasti.lat, edellinenRasti.lon, tamaRasti.lat, tamaRasti.lon);
					edellinenRasti = tamaRasti;
				}
				//Jos edellistä rastia ei ole, tallenetaan tämä rasti edelliseksi.
				if (edellinenRasti == undefined)
					edellinenRasti = tamaRasti;
			}
		}
		//Kun rastit on käyty läpi, katsotaan joukkueen käyttämä aika.
		if (ensimmainenAika!=""&& rastiArray.length > 0 )
			joukkueet[i].aika = new Date(rastiArray[rastiArray.length-1].a) - new Date(ensimmainenAika);
	}
	return joukkueet;
};

/*	lisaaJoukkue(joukkue)
---------------------------------------------------------------------
	joukkue = { id , jasenet , last , nimi , sarja , seura }
---------------------------------------------------------------------
	Funktiolla lisätään data-tietorakenteeseen funktiolle parametrina
	tuodun joukkueen.
*/
function lisaaJoukkue(joukkue) {
	data.joukkueet.push(joukkue);
};

/*	tulostaRastit()
---------------------------------------------------------------------
	Funktio tulostaa konsoliin kaikkien kokonaisluvulla alkavien 
	rastien koodit. 
*/
function tulostaRastit() {
	let rastilista = "";
	//Käydään rastit läpi ja katsotaan alkumerkki.
	for (var i = 0; i < data.rastit.length; i++) {
		var alkumerkki = data.rastit[i].koodi[0];
		if (alkumerkki === '0' || 
			alkumerkki === '1' ||  
			alkumerkki === '2' || 
			alkumerkki === '3' || 
			alkumerkki === '4' || 
			alkumerkki === '5' || 
			alkumerkki === '6' || 
			alkumerkki === '7' || 
			alkumerkki === '8' || 
			alkumerkki === '9') {
				rastilista = rastilista + " " + data.rastit[i].koodi;
		}
	}
	console.log(rastilista);
};

/*	poistaJoukkue(joukkueenNimi)
---------------------------------------------------------------------
	Funktio poistaa tietorakenteesta nimen perusteella joukkueen.
*/
function poistaJoukkue(joukkueenNimi) {
	for (var i = 0; i < data.joukkueet.length; i++) {
		if (data.joukkueet[i].nimi === joukkueenNimi) {
			data.joukkueet.splice(i,1);
			break; //Lopetetaan looppi, jottei käydäkään enää muuttunutta tietuetta läpi.
		}
	}
};

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

/*	ms2Time(millisekuntit)
---------------------------------------------------------------------
	Muuttaa annetut millisekunnit muotoon hh:mm:ss
*/
function ms2Time(millisekuntit) {
	var ms = 	parseInt((millisekuntit%1000)/100)
		, sec =	parseInt((millisekuntit/10000)%60)
		, min =	parseInt((millisekuntit/(1000*60))%60)
		, hh =	parseInt((millisekuntit/(1000*60*60))%24);
	
	hh = 	(hh < 10) ? "0" + hh : hh;
	min = 	(min < 10) ? "0" + min : min;
	sec = 	(sec < 10) ? "0" + sec: sec;
	return hh + ":" + min + ":" + sec;
}

// data-muuttuja sisältää taso 1 vaatimat tiedot. Tasoilla 3 ja 5 tarvitaan myös tupa-muuttujan tietoja.

// voit tutkia tarkemmin käsiteltäviä tietorakenteita konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa datat osoitteista:
// http://appro.mit.jyu.fi/tiea2120/vt/vt1/data.json
// http://appro.mit.jyu.fi/tiea2120/vt/vt1/tupa.json

console.log(data);

console.log(tupa);

lisaaJoukkue({
	"nimi": "Mallijoukkue",
	"last": "2017-09-01 10:00:00",
	"jasenet": [
		"Tommi Lahtonen",
		"Matti Meikäläinen"
	],
	"sarja": 5639189416640512,
	"seura": null,
	"id": 99999
});
poistaJoukkue("Vara 1");
poistaJoukkue("Vara 2");
poistaJoukkue("Tollot");
tulostaNimet();
tulostaRastit();
tulostaNimetJaPisteet();
tulostaTaso5();
