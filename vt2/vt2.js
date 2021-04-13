// Kirjoita tänne oma ohjelmakoodisi

// data-muuttuja on sama kuin viikkotehtävässä 1.
// tupa-muuttuja on yksinkertaistettu versio viikkotehtävästä 1.
//
// voit tutkia tarkemmin käsiteltäviä tietorakenteita konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa datat osoitteista:
// http://appro.mit.jyu.fi/tiea2120/vt/vt2/data.json
// http://appro.mit.jyu.fi/tiea2120/vt/vt2/tupa.json
//
// http://jsoneditoronline.org/?url=http%3A%2F%2Fappro.mit.jyu.fi%2Ftiea2120%2Fvt%2Fvt2%2Fdata.json
// http://jsoneditoronline.org/?url=http%3A%2F%2Fappro.mit.jyu.fi%2Ftiea2120%2Fvt%2Fvt2%2Ftupa.json

"use strict";

/* Globaalit muuttujat
* -------------------------------------------------------------------
*	joukkue_data		=	Uudelleentehty tietorakenne, jossa joukkueiden pisteet mukana
*	form_rasti			=	Lomake jolla lisätä rasteja.
*	form_joukkue		=	Lomake jolla voi lisätä tai muokata joukkueita
*	joukkue_edit_flag	=	{
								TRUE:	Muokataan joukkuetta
								FALSE:	Luodaan uusi joukkue
							}
*	joukkue_editoitava	=	Monesko joukkue kyseessä, jota tulisi editoida
*	rivi_editoitava		=	Mitä riviä täytyy editoida?
*/
var joukkue_data = [];
var form_rasti;
var form_joukkue;
var jasen_lkm = 0;
var joukkue_edit_flag = false;
var joukkue_editoitava = -1;
var rivi_editoitava = undefined;

/*	window.onload = function()
* -------------------------------------------------------------------
*	Tulos-palvelu
* -------------------------------------------------------------------
*	window.onload on periaatteessa kuin muiden kielien Main.
*	Tämä koodi latautuu, kun HTML dokumentti on saatu ladattua.
*/
window.onload = function() {
	console.log(data);
	console.log(tupa);
	
	listaa_joukkueet();
	listaa_rastit();
	luo_lomake_rasti();
	luo_lomake_joukkueet();
};

/*	alusta_joukkue_data()
* -------------------------------------------------------------------
*	Täyttää joukkue_data -muuttujan data.joukkueet tiedoilla,
*	sekä laskee pisteet joukkueille.
*/
function alusta_joukkue_data() {
	// Jos vahingossa kutsutaan funktiota, niin tyhjennetään joukkuedata jottei tule duplikaatteja.
	joukkue_data = [];
	/*
		käydään data.joukkueet läpi ja täytetään tietoja joukkue_dataan
	*/
	for (var i = 0; i < data.joukkueet.length; i++) {
		joukkue_data.push({
			id: data.joukkueet[i].id,
			nimi: data.joukkueet[i].nimi,
			pisteet: 0,
			rastit: []
		});
	}
	/*
		Käydään tupa läpi ja lisäillään joukkue_dataan joukkueiden käymät rastit
	*/
	for (var i = 0; i < tupa.length; i++) {
		for (var j = 0; j < joukkue_data.length; j++) {
			if (tupa[i].j === joukkue_data[j].id) {
				joukkue_data[j].rastit.push(tupa[i]);
			}
		}
	}
	/*
		Käydään joukkue-kohtaisesti rastit läpi ja tarkastetaan niiden rastikoodit, sekä lasketaan pisteet.
	*/
	for (var i = 0; i < joukkue_data.length; i++) {
		// Lajitellaan rastit ajan mukaan [Tätä ei olisi tarvinnut Taso 3 - tämä olisi vain helpottanut aikojen ja matkojen laskemisessa]
		joukkue_data[i].rastit.sort(function(a, b) {
			var aikaA = a.a; 
			var aikaB = b.a;
			if (aikaA < aikaB) {
				return -1;
			}
			if (aikaA > aikaB) {
				return 1;
			}
			return 0;
		});
		// kaydyt rastit: missä rasteissa on käyty, kirjataan jotta tiedetään ettei lasketa useaan kertaan samoja
		var kaydyt_rastit = [data.rastit.length];
		for (var j = 0; j < joukkue_data[i].rastit.length; j++) {
			for (var k = 0; k < data.rastit.length; k++) {
				if (data.rastit[k].id == joukkue_data[i].rastit[j].r) {
					// Jos rastilla ei ole käyty ja jos rastin koodin ensimmäinen merkki on numero niin lisätään pisteinä se joukkueelle.
					if (kaydyt_rastit[k] === undefined) {
						if (!isNaN(data.rastit[k].koodi[0])) {
							joukkue_data[i].pisteet += parseInt(data.rastit[k].koodi[0]);
							kaydyt_rastit[k] = 1;
						}
					}
				}
			}
		}
	}
};

/*	listaa_joukkueet()
* -------------------------------------------------------------------
*	Listaa www-sivulla taulukkomuodossa joukkueet nimen mukaan 
*	aakkostettuna ja joukkueiden pisteet.
*	Ykköstasolla kaikkien joukkueiden pistemäärä on nolla (0).
*	Tasolla 3 järjestetään pisteiden mukaan.
*/
function listaa_joukkueet() {
	// Alustetaan ensin joukkue_data
	alusta_joukkue_data();
	
	// Luodaan taulu, lisätään sille otsikko
	var taulu = document.createElement("table");
	var otsikko = document.createElement("caption");
	otsikko.textContent = "Tulokset";
	taulu.appendChild(otsikko);
	// Luodaan tauluun otsakerivi
	var rivi = document.createElement("tr");
	var sarake = document.createElement("th");
	sarake.textContent = "Joukkue";
	rivi.appendChild(sarake);
	sarake = document.createElement("th");
	sarake.textContent = "Pisteet";
	rivi.appendChild(sarake);
	taulu.appendChild(rivi);
	// Käydään läpi joukkueet ja lisätään rivit
	for (var i = 0; i < data.joukkueet.length; i++) {
		rivi = document.createElement("tr");
		sarake = document.createElement("td");
		// Luodaan linkki, lisätään sille eventListener jotta voidaan hallita mitä klikatessa tapahtuu
		var linkki = document.createElement("a");
		linkki.setAttribute("href","#joukkue");
		linkki.appendChild(document.createTextNode(data.joukkueet[i].nimi));
		linkki.addEventListener('click',muokkaa_joukkuetta);
		sarake.appendChild(linkki);
		// Lisätään rivinvaihto
		sarake.appendChild(document.createElement("br"));
		// Kasataan jäsenten nimet samaan merkkijonoon ja syljetään se textNodeen
		var jasen_nimet = data.joukkueet[i].jasenet[0];
		for (var j = 1; j < data.joukkueet[i].jasenet.length; j++) {
			jasen_nimet = jasen_nimet+", "+data.joukkueet[i].jasenet[j];
		}
		sarake.appendChild(document.createTextNode(jasen_nimet));
		rivi.appendChild(sarake);
		// Lisätään lopuksi vielä joukkueen pisteet riville.
		sarake = document.createElement("td");
		sarake.textContent = joukkue_data[i].pisteet;
		rivi.appendChild(sarake);
		taulu.appendChild(rivi);
	}
	// Sijoitetaan luotu taulu tupa-diviin
	document.getElementById("tupa").appendChild(taulu);
	
	// Järjestetään rivit pisteiden mukaan.
	var rivit, vaihda, eka, toka, pitaaVaihtaa;
	
	// Taulun järjestämiskoodi
	vaihda = true;
	while (vaihda) {
		vaihda = false; // Loopista päästään pihalle jos ei nähdä enää tarvetta muutokselle, heti kun tarve ilmenee
		// niin vaihdetaan vaihda -muuttujan arvo trueksi.
		rivit = taulu.getElementsByTagName("TR");
		for (var i = 1; i < (rivit.length -1); i++) {
			pitaaVaihtaa = false;
			
			// TD:t[1] on aina pisteet
			eka = rivit[i].getElementsByTagName("td")[1];
			toka = rivit[i+1].getElementsByTagName("td")[1];
			
			if (parseInt(eka.textContent) < parseInt(toka.textContent)) {
				pitaaVaihtaa = true;
				break;
			}
		}
		if (pitaaVaihtaa) {
			rivit[i].parentNode.insertBefore(rivit[i+1],rivit[i]);
			vaihda = true;
		}
	}
};

/*	listaa_rastit()
* -------------------------------------------------------------------
*	Listaa www-sivulla taulukkomuodossa rastien koodit ja rastien 
*	koordinaatit. Rastit listataan koodin mukaan aakkosjärjestyksessä
*	KÄYTETTÄVÄ VAIN ALUSTAMISEEN!
*/
function listaa_rastit() {
	// Haetaan kaikki h2 -elementit
	var h2t = document.getElementsByTagName("h2");
	
	// Etsitään se elementti jossa lukee "Rastit"
	var elem_rasti;
	for (var i = 0; i < h2t.length; i++) {
		if (h2t[i].textContent === "Rastit") {
			elem_rasti = h2t[i];
			break;
		}
	}
	// Luodaan taulu
	var taulu = document.createElement("table");
	// Luodaan rivi
	var rivi = document.createElement("tr");
	// Kirjoitetaan taulun headerit TH-elementteihin ja lisätään riville, jonka jälkeen lisätään header rivi tauluun.
	var sarake = document.createElement("th");
	sarake.textContent = "Rasti";
	rivi.appendChild(sarake);
	sarake = document.createElement("th");
	sarake.textContent = "Lat";
	rivi.appendChild(sarake);
	sarake = document.createElement("th");
	sarake.textContent = "Lon";
	rivi.appendChild(sarake);
	taulu.appendChild(rivi);
	// Lajitellaan rastit mieleiseen järjestykseen.
	data.rastit.sort(function(a, b) {
		//Muutetaan uppercaseksi, jotta vertailu olisi helpompaa.
		var nimiA = a.koodi.toUpperCase(); 
		var nimiB = b.koodi.toUpperCase();
		if (nimiA < nimiB) {
			return -1;
		}
		if (nimiA > nimiB) {
			return 1;
		}
		return 0;
	});
	// Kirjoitetaan data.rastit sisällöt omille riveilleen.
	for (var i = 0; i < data.rastit.length; i++) {
		rivi = document.createElement("tr");
		sarake = document.createElement("td");
		sarake.textContent = data.rastit[i].koodi;
		rivi.appendChild(sarake);
		sarake = document.createElement("td");
		sarake.textContent = data.rastit[i].lat;
		rivi.appendChild(sarake);
		sarake = document.createElement("td");
		sarake.textContent = data.rastit[i].lon;
		rivi.appendChild(sarake);
		taulu.appendChild(rivi);
	}
	
	// Lisätään haetun h2-elementin perään luotu taulu.
	lisaa_jalkeen(taulu, elem_rasti);
};

/*	luo_lomake_rasti()
* -------------------------------------------------------------------
*	Luo lomake, jolla voi lisätä uuden rastin. Jos kaikkia tietoja 
*	(koodi, lat ja lon) ei ole täytetty, niin lisäystä ei tehdä. Uusi 
*	rasti täytyy lisätä sekä tietorakenteeseen, että sivulla näkyvään 
*	listaukseen oikeaan kohtaan.
*/
function luo_lomake_rasti() {
	// Haetaan kaikki h2 -elementit
	var h2t = document.getElementsByTagName("h2");
	
	// Kelataan löytyneet h2 -elementit läpi ja etsitään sitä jossa lukee "Lisää rasti"
	var elem_h2;
	for (var i = 0; i < h2t.length; i++) {
		if (h2t[i].textContent === "Lisää rasti") {
			elem_h2 = h2t[i];
			break;
		}
	}
	
	// Seuraavaksi etsitään löydetystä "Lisää rasti"-otsikosta 
	// lähtien kaikki sisaruselementit ja etsitään niistä formit.
	// Ensimmäinen vastaantuleva formi on oikea formi.
	form_rasti = etsi_seuraava(elem_h2, "FORM");
	var fieldset = document.createElement("fieldset");
	var legend = document.createElement("legend");
	legend.textContent = "Rastin tiedot";
	fieldset.appendChild(legend);
	
	// Luodaan Lat -Kenttä
	var param = document.createElement("p");
	var label = document.createElement("label");
	label.textContent = "Lat ";
	var txtKentta = document.createElement("input");
	txtKentta.setAttribute("type","text");
	txtKentta.setAttribute("value","");
	label.appendChild(txtKentta);
	param.appendChild(label);
	fieldset.appendChild(param);
	
	// Luodaan Lon -kenttä
	param = document.createElement("p");
	label = document.createElement("label");
	label.textContent = "Lon ";
	txtKentta = document.createElement("input");
	txtKentta.setAttribute("type","text");
	txtKentta.setAttribute("value","");
	label.appendChild(txtKentta);
	param.appendChild(label);
	fieldset.appendChild(param);
	
	// Luodaan Koodi -kenttä
	param = document.createElement("p");
	label = document.createElement("label");
	label.textContent = "Koodi ";
	txtKentta = document.createElement("input");
	txtKentta.setAttribute("type","text");
	txtKentta.setAttribute("value","");
	label.appendChild(txtKentta);
	param.appendChild(label);
	fieldset.appendChild(param);
	
	// Luodaan nappi
	param = document.createElement("p");
	var nappi = document.createElement("button");
	nappi.setAttribute("name","rasti");
	nappi.setAttribute("id","rasti");
	nappi.appendChild(document.createTextNode("Lisää rasti"));
	nappi.addEventListener('click', lisaa_uusi_rasti);
	param.appendChild(nappi);
	fieldset.appendChild(param);
	
	form_rasti.appendChild(fieldset);
	
};

/*	luo_lomake_joukkueet()
* -------------------------------------------------------------------
*	Luo joukkueiden lisäyslomakkeen
*/
function luo_lomake_joukkueet() {
	
	// Haetaan kaikki h2 -elementit
	var h2t = document.getElementsByTagName("h2");
	
	// Kelataan löytyneet h2 -elementit läpi ja etsitään sitä jossa lukee "Joukkue"
	var elem_h2;
	for (var i = 0; i < h2t.length; i++) {
		if (h2t[i].textContent === "Joukkue") {
			elem_h2 = h2t[i];
			break;
		}
	}
	
	// Luodaan FORM -elementti
	form_joukkue = document.createElement("form");
	form_joukkue.setAttribute("action","foobar.ei.toimi.example");
	form_joukkue.setAttribute("id","joukkue");
	form_joukkue.setAttribute("method","post");
	var fieldset = document.createElement("fieldset");
	var legend = document.createElement("legend");
	legend.textContent = "Uusi joukkue";
	fieldset.appendChild(legend);
	var input_param = document.createElement("p");
	var lappu = document.createElement("label");
	lappu.appendChild(document.createTextNode("Nimi "));
	var syote = document.createElement("input");
	syote.setAttribute("type","text");
	syote.setAttribute("value","");
	// Lisätään eventlistener, jotta tiedetään että ruutua on muokattu
	syote.addEventListener('change',tarkasta_joukkue_lomake);
	lappu.appendChild(syote);
	input_param.appendChild(lappu);
	fieldset.appendChild(input_param);
	
	var fieldset_jasenet = document.createElement("fieldset");
	legend = document.createElement("legend");
	legend.textContent = "Jäsenet";
	fieldset_jasenet.appendChild(legend);
	input_param = lisaa_jasen_input();
	fieldset_jasenet.appendChild(input_param);
	input_param = lisaa_jasen_input();
	fieldset_jasenet.appendChild(input_param);
	fieldset.appendChild(fieldset_jasenet);
	form_joukkue.appendChild(fieldset);
	var nappi = document.createElement("button");
	nappi.setAttribute("name","joukkue");
	nappi.setAttribute("id","joukkuen");
	nappi.setAttribute("disabled",true);
	// Eventlistener jolla katsotaan klikataanko nappia.
	nappi.addEventListener('click',paivita_joukkue_dataa);
	nappi.appendChild(document.createTextNode("Lisää joukkue"));
	input_param = document.createElement("p");
	input_param.appendChild(nappi);
	fieldset.appendChild(nappi);
	lisaa_jalkeen(form_joukkue,elem_h2);
};

/* lisaa_jasen_input(nimi)
* -------------------------------------------------------------------
*	Luodaan jäsenen nimi-input, joka koostuu P -elementistä, jossa on
*	lapsielementteinä LABEL (jossa lukee Jäsen N) sekä INPUT[type=text]
* -------------------------------------------------------------------
*	nimi	INPUT-kenttään ilmestyvä teksti/Oletusvalue
*	return 	luotu elementti
*/
function lisaa_jasen_input(nimi) {
	jasen_lkm++;
	var input_param = document.createElement("p");
	var lappu = document.createElement("label");
	lappu.appendChild(document.createTextNode("Jäsen " + jasen_lkm + " "));
	var txtKentta = document.createElement("input");
	txtKentta.setAttribute("type","text");
	if (nimi !== undefined)
		txtKentta.setAttribute("value",nimi);
	else
		txtKentta.setAttribute("value","");
	txtKentta.addEventListener('change',tarkastaJasenet);
	lappu.appendChild(txtKentta);
	input_param.appendChild(lappu);
	return input_param;
};

/*	tarkastaJasenet
* ------------------------------------------------------------------
*	Tarkastetaan onko kaikki jäsen-ruudut täytetty ja jos on niin 
*	luodaan uusi input-kenttä. Lopuksi tarkastetaan koko lomake.
*/
function tarkastaJasenet() {
	var fieldset = form_joukkue.getElementsByTagName("fieldset")[1];
	var syotteet = fieldset.getElementsByTagName("input");
	var syotteet_taynna = true;
	for (var i = 0; i < syotteet.length; i++) {
		if (syotteet[i].value === "") {
			syotteet_taynna = false;
		} else {
		}
	}
	if (syotteet_taynna) {
		fieldset.appendChild(lisaa_jasen_input());
		
	}
	tarkasta_joukkue_lomake();
};

/* tarkasta_joukkue_lomake()
* -------------------------------------------------------------------
*	Tarkastaa joukkueen lisäyslomakkeen tiedot ja aktivoi tarvittaessa
*	lomakkeen napin. Jos tiedot ovat puutteellisesti täytetyt, 
*	deaktivoidaan/disabloidaan nappi.
*/
function tarkasta_joukkue_lomake() {
	
	var jasenet = form_joukkue.getElementsByTagName("fieldset")[1].getElementsByTagName("input");
	var nimikentta = form_joukkue.getElementsByTagName("input")[0];
	// Lasketaan montako nimikenttää on täynnä. Joukkueen lisäyksessä jäsenten minimimäärä on 2.
	var taynna_olevat = 0;
	for (var i = 0; i < jasenet.length; i++) {
		if (jasenet[i].value !=="") {
			taynna_olevat++;
		}
	}
	if (taynna_olevat >= 2 && nimikentta.value !== "") {
		document.getElementById("joukkuen").removeAttribute("disabled");
	} else {
		document.getElementById("joukkuen").setAttribute("disabled",true);
	}
};

/*	lisaa_uusi_rasti(e)
* -------------------------------------------------------------------
*	Tarkastaa lomakkeen tiedot ja lisää uuden rastin.
*/
function lisaa_uusi_rasti(e) {
	// Estetään napin oletustoiminta
	e.preventDefault();
	var kentat = form_rasti.getElementsByTagName("input");
	// Oletuksella kaikissa kentissä on tietoa
	var tarkastus_pass = true;
	for (var i = 0; i < kentat.length; i++) {
		if (kentat[i].value === "") // Jos kentässä ei olekkaan tietoa, niin tarkastus epäonnistuu
			tarkastus_pass = false;
	}
	if (!tarkastus_pass) {
		console.log("Jokin kenttä jäi tyhjäksi.");
	} else {
		console.log("Toiminto voidaan suorittaa!");
		
		// Oletin että ID on edellisen ID + 1 ja että rastien kilpailu-ID on sama.
		data.rastit.push({
			id: data.rastit[data.rastit.length-1].id + 1,
			kilpailu: 5372934059196416,
			koodi: kentat[2].value,
			lat: kentat[0].value,
			lon: kentat[1].value
		});
		
		// Alustetaan uudelleenjärjestelyn muuttujat
		var taulu, rivit, vaihda, eka, toka, pitaaVaihtaa;
		
		// Haetaan kaikki H2-elementit
		var h2t = document.getElementsByTagName("h2");
		// Etsitään otsikko jossa lukee Rastit, jotta tiedetään 
		// Mistä etsiä taulua.
		var elem_rasti;
		for (var i = 0; i < h2t.length; i++) {
			if (h2t[i].textContent === "Rastit") {
				elem_rasti = h2t[i];
				break;
			}
		}
		// Haetaan otsikosta seuraava taulu
		taulu = etsi_seuraava(elem_rasti,"TABLE");
		// Luodaan tauluun uusi rivi johon täytetään rastin tiedot
		var rivi = document.createElement("tr");
		var sarake = document.createElement("td");
		sarake.textContent = kentat[2].value;
		rivi.appendChild(sarake);
		sarake = document.createElement("td");
		sarake.textContent = kentat[0].value;
		rivi.appendChild(sarake);
		sarake = document.createElement("td");
		sarake.textContent = kentat[1].value;
		rivi.appendChild(sarake);
		taulu.appendChild(rivi);
		
		/*
			Elementtien järjestely, jotta saadaan uusi rivi oikeaan paikkaan.
			Tämä esiintyi aiemmin jo koodissa, joten en kokenut tarpeelliseksi selostaa uudestaan toimintaa.
		*/
		vaihda = true;
		while (vaihda) {
			vaihda = false;
			rivit = taulu.getElementsByTagName("TR");
			for (var i = 1; i < (rivit.length -1); i++) {
				pitaaVaihtaa = false;
				
				eka = rivit[i].getElementsByTagName("td")[0];
				toka = rivit[i+1].getElementsByTagName("td")[0];
				
				if (eka.textContent.toLowerCase() > toka.textContent.toLowerCase()) {
					pitaaVaihtaa = true;
					break;
				}
			}
			if (pitaaVaihtaa) {
				rivit[i].parentNode.insertBefore(rivit[i+1],rivit[i]);
				vaihda = true;
			}
		}
	};
};

/*	paivita_joukkue_dataa(e)
* -------------------------------------------------------------------
*	Funktio katsoo, tarvitseeko päivittää jotain joukkuetta vai 
*	luoda uusi joukkue ja sen perusteella kutsuu oikeaa funktiota.
* -------------------------------------------------------------------
*	e	oletustapahtuma joka perutaan ja korvataan toisella tapahtumalla.
*/
function paivita_joukkue_dataa(e) {
	e.preventDefault();
	if (joukkue_edit_flag) {
		paivita_joukkuetta();
	} else {
		luo_uusi_joukkue();
	}
};

/*	paivita_joukkuetta() 
* -------------------------------------------------------------------
*	Muokkaa joukkuedataa FORM -elementissä esiintyvien inputien 
*	mukaiseksi.
*/
function paivita_joukkuetta() {
	// Haetaan HTML elementit valmiiksi muuttujiin.
	var nimikentta = form_joukkue.getElementsByTagName("input")[0];
	var jasenet_fieldset = form_joukkue.getElementsByTagName("fieldset")[1];
	var jasenien_input = jasenet_fieldset.getElementsByTagName("input");
	var rivi = rivi_editoitava.parentNode;
	
	var sarake = rivi.getElementsByTagName("td")[0];
	// Tyhjennetään rivin ensimmäinen sarake, jonka sisältö on jotain tyyliin:
	//	<a href="#joukkue">Ryhmä</a> <br />Etunimi1 Sukunimi1, Etunimi2 Sukunimi2,...
	while (sarake.firstChild) {
		sarake.removeChild(sarake.firstChild);
	}
	// Luodaan riville uusi linkki
	var linkki = document.createElement("a");
	linkki.setAttribute("href","#joukkue");
	linkki.textContent = nimikentta.value;
	linkki.addEventListener('click',muokkaa_joukkuetta);
	// Päivitetään vielä tietorakenteiden joukkueiden nimien tiedot.
	joukkue_data[joukkue_editoitava].nimi = nimikentta.value;
	data.joukkueet[joukkue_editoitava].nimi = nimikentta.value;
	
	sarake.appendChild(linkki);
	sarake.appendChild(document.createElement("br"));
	// Kerätään jäsenten nimet ja päivitetään ne niin data.joukkueet kuin oikean rivin sarakkeeseenkin.
	// Tyhjennetään ensin jasenet -arrayn tiedot ja lisätään sitten loopissa niitä takaisin.
	data.joukkueet[joukkue_editoitava].jasenet = [];
	var jasen_nimet = "";
	for (var i = 0; i < jasenien_input.length; i++) {
		if (jasenien_input[i].value !== "") {
			jasen_nimet = jasen_nimet + ", " + jasenien_input[i].value;
			data.joukkueet[joukkue_editoitava].jasenet.push(jasenien_input[i].value);
		}
	}
	// Syödään alusta pois 2 ensimmäistä merkkiä, sillä ne tulevat aina olemaan ',' ja ' '
	jasen_nimet = jasen_nimet.substring(2);
	sarake.appendChild(document.createTextNode(jasen_nimet));
	
	
	// Tyhjennetään lomakkeen tiedot
	nimikentta.value = "";
	var jasenet_fieldset = form_joukkue.getElementsByTagName("fieldset")[1];
	// Pyöräytellään jäseniä sisältävän fieldsetin läpi ja tyhjennetään sisältö
	while (jasenet_fieldset.firstChild) {
		jasenet_fieldset.removeChild(jasenet_fieldset.firstChild);
	}
	// Pistetään jäsenkenttien lukumäärä takaisin nollaksi, sillä ne on poistettu.
	jasen_lkm = 0;
	// Lisätään takaisin 2 jäsen-inputtia
	jasenet_fieldset.appendChild(lisaa_jasen_input());
	jasenet_fieldset.appendChild(lisaa_jasen_input());
	joukkue_edit_flag = false;
};

/*	luo_uusi_joukkue()
* -------------------------------------------------------------------
*	Luodaan uusi joukkue lomakkeesta löytyvillä tiedoilla.
*/
function luo_uusi_joukkue() {
	// Haetaan kaikki annettu data.
	/*
		MUUTTUJA		SISÄLTÖ
		jasenia			Sisältää kaikkien nimikenttien arvot, joissa on dataa (eli skippaa tyhjät kentät)
		jasenet			Sisältää kaikki Jäsenet -nimikenttäelementit
		nimikentta		Sisältää joukkueen nimikentän elementin
		jasenten_nimet	Sisältää merkkijonon, jossa on jäsenten nimet.
	*/
	var jasenia = [];
	var jasenet = form_joukkue.getElementsByTagName("fieldset")[1].getElementsByTagName("input");
	var nimikentta = form_joukkue.getElementsByTagName("input")[0];
	var jasenten_nimet = "";
	// Käydään kaikki jäsenten nimikenttäelementit läpi ja katsotaan onko niissä sisältöä
	for (var i = 0; i < jasenet.length; i++) {
		if (jasenet[i].value !=="") {
			jasenia.push(jasenet[i].value);
			jasenten_nimet = jasenten_nimet + ", " + jasenet[i].value;
		}
	}
	// Leikataan jasenten_nimet -muuttujasta ensimmäiset 2 merkkiä pois, sillä ne ovat ',' ja ' '
	jasenten_nimet = jasenten_nimet.substring(2);
	
	// Lisätään tietorakenteeseen tieto uudesta joukkueesta
	data.joukkueet.push({
		id: data.joukkueet[data.joukkueet.length-1].id+1, // Ei ole tietoa millä ID määräytyy, joten oletin että edellisen joukkueen ID + 1
		jasenet: jasenia,
		last: null,
		nimi: nimikentta.value,
		sarja: null,
		seura: ""
	});
	// Päivitetään vielä ylimääräinen tietorakenne ajan tasalle
	joukkue_data.push({
			id: data.joukkueet[data.joukkueet.length-1].id+1,
			nimi: nimikentta.value,
			pisteet: 0,
			rastit: []
	});
	
	// Listataan uusi joukkue taulukkoomme
	var taulu = document.getElementById("tupa").getElementsByTagName("TABLE")[0];
	
	var rivi = document.createElement("tr");
	var sarake = document.createElement("td");
	var linkki = document.createElement("a");
	linkki.setAttribute("href","#joukkue");
	linkki.appendChild(document.createTextNode(nimikentta.value));
	linkki.addEventListener('click',muokkaa_joukkuetta);
	sarake.appendChild(linkki);
	sarake.appendChild(document.createElement("br"));
	sarake.appendChild(document.createTextNode(jasenten_nimet));
	rivi.appendChild(sarake);
	sarake = document.createElement("td");
	sarake.appendChild(document.createTextNode(0));
	rivi.appendChild(sarake);
	console.log(taulu);
	taulu.appendChild(rivi);
	
	// Koska joukkueet järjestellään vain pisteiden mukaan, uutta joukkuetta ei tarvitse sijoittaa muualle kuin taulun loppuun. :)
	
	// Tyhjennetään lomakkeen tiedot
	nimikentta.value = "";
	var jasenet_fieldset = form_joukkue.getElementsByTagName("fieldset")[1];
	// Pyöräytellään jäseniä sisältävän fieldsetin läpi ja tyhjennetään sisältö
	while (jasenet_fieldset.firstChild) {
		jasenet_fieldset.removeChild(jasenet_fieldset.firstChild);
	}
	// Pistetään jäsenkenttien lukumäärä takaisin nollaksi, sillä ne on poistettu.
	jasen_lkm = 0;
	// Lisätään takaisin 2 jäsen-inputtia
	jasenet_fieldset.appendChild(lisaa_jasen_input());
	jasenet_fieldset.appendChild(lisaa_jasen_input());
};

/*	muokkaa_joukkuetta(e)
* -------------------------------------------------------------------
*	Tätä funktiota kutsutaan, kun klikataan jonkin joukkueen linkkiä.
*	Funktio täydentää joukkuelomakkeelle joukkueen tiedot ja kirjaa
*	ylös mikä rivi kutsui muokkausta.
* -------------------------------------------------------------------
*	e		oletustapahtuma joka korvataan uudella toiminnolla.
*	return	onnistuiko lomakkeen päivitys vai ei.
*/
function muokkaa_joukkuetta(e) {
	e.preventDefault();
	// Muutetaan flagia, jotta sovellus tietää että nyt lomake toimiikin
	// joukkueen päivittämiseen.
	joukkue_edit_flag = true;
	var rivi = this.parentNode;
	rivi_editoitava = this.parentNode;
	//	Haetaan kentät joita muokata.
	var nimikentta = form_joukkue.getElementsByTagName("input")[0];
	var joukkue_nimi = rivi.getElementsByTagName("a")[0].textContent;
	
	// Etsitään monesko alkio arraysta on kyseessä. Oletuksena -1 (eli arrayn ulkopuolella = ei ole olemassa)
	var joukkue_nro = -1;
	for (var i = 0; i < data.joukkueet.length; i++) {
		if (data.joukkueet[i].nimi === joukkue_nimi) {
			joukkue_nro = i;
			break;
		}
	}
	
	if (joukkue_nro === -1) {
		console.log("Jokin meni pieleen etsiessä muokattavaa joukkuetta.");
		joukkue_edit_flag = false;
		return false; 
	} else {
		// Täytetään nimikenttään joukkueen nimi, tyhjennetään jäsenkentät ja täytetään se sitten 
		// uusilla inputeilla joilla oletusarvoina käyttäjien nimet
		nimikentta.value = joukkue_nimi;
		var jasenet_fieldset = form_joukkue.getElementsByTagName("fieldset")[1];
		while (jasenet_fieldset.firstChild) {
			jasenet_fieldset.removeChild(jasenet_fieldset.firstChild);
		}
		jasen_lkm = 0;
		for (var i = 0; i < data.joukkueet[joukkue_nro].jasenet.length; i++) {
			jasenet_fieldset.appendChild(lisaa_jasen_input(data.joukkueet[joukkue_nro].jasenet[i]));
		}
		// Lisätään vielä tyhjä jos käyttäjä haluaakin lisätä henkilöitä.
		jasenet_fieldset.appendChild(lisaa_jasen_input());
	}
	// Otetaan talteen joukkueen sijainti data.joukkueet -arrayssa jotta muokataan sitten oikeita alkioita.
	joukkue_editoitava = joukkue_nro;
	return true;
};

/*	lisaa_jalkeen(uusi, vanha)
* -------------------------------------------------------------------
*	Lisätään elementin perään toinen elementti. 
*	Javascriptistä löytyy natiivina vain insertBefore, eli tämä
*	toimii kuin voisi kuvitella insertAfter:in toimivan.
* -------------------------------------------------------------------
*	uusi	Lisättävä elementti
*	vanha	Elementti, jonka perään lisätään 'uusi'-elementti
*/
function lisaa_jalkeen(uusi, vanha) {
	vanha.parentNode.insertBefore(uusi, vanha.nextSibling);
}

/*	etsi_seuraava(el, tag)
* -------------------------------------------------------------------
*	Etsitään annetusta elementistä seuraava tiettyä tagia oleva elementti
*	esimerkiksi otsikosta seuraava esiintyvä TABLE -elementti.
* -------------------------------------------------------------------
*	el		Elementti, josta lähdetään etsimään seuraavaa löytyvää elementtiä.
*	tag		Tagi, joka etsittävällä pitää olla.
*	return	löydetty ensimmäinen elementtiä seuraava haettu elementti.
*/
function etsi_seuraava(el, tag) {
	// Kerätään muuttujaan kaikki ne elementit joiden tag vastaa haettavaa tagia.
	var seuraavat = [];
	var elem = el;
	while (elem = elem.nextSibling) {
		if (elem.tagName === tag) {
			seuraavat.push(elem);
		}
	}
	return seuraavat[0];
}