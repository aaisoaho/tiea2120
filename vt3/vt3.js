// data-muuttuja sisältää kaiken tarvittavan ja on rakenteeltaan lähes samankaltainen kuin viikkotehtävässä 2
// Rastileimaukset on siirretty tupa-rakenteesta suoraan jokaisen joukkueen yhteyteen
//
// voit tutkia tarkemmin käsiteltävää tietorakennetta konsolin kautta 
// tai json-editorin kautta osoitteessa http://jsoneditoronline.org/
// Jos käytät json-editoria niin avaa data osoitteesta:
// http://appro.mit.jyu.fi/tiea2120/vt/vt3/data.json

"use strict";

console.log(data);

/* GLOBAALIT MUUTTUJAT
* -------------------------------------------------------------------
*	leimaus				Sisältää leimaus-checkbox-elementit
*	sarja				Sisältää sarja-radionappi-elementit
*	jasenet				Sisältää jäsenet -tekstikenttien elementit
*	uusin_id			Uusin joukkue-id data-tietorakenteesta 
*						(ts. ensimmäinen vapaa ID)
*	uusin_sarja_id		Uusin sarjan id data-tietorakenteesta 
*						(ts. ensimmäinen vapaa ID)
*/
var leimaus, sarja, jasenet, uusin_id, uusin_sarja_id, uusin_kisa_id, joukkue_edit = -1, li_edit;

/* window.onload = function()
* -------------------------------------------------------------------
*	Suunnistus-aiheinen web-sovellus
*/
window.onload = function() {
	// Muutetaan tietorakenne tukemaan useita kisoja.
	paivita_kisa_tietorakenne();
	// Log kutsu siksi että näkee mitenkä tietorakenne muuttui.
	console.log(data);
	// Kerätään muuttujiin lomakkeen elementit
	let jNimi = document.getElementById("jNimi"),
		luontiAika = document.getElementById("luontiAika"),
		nappi = document.getElementsByName("tallenna")[0];
	leimaus = document.getElementsByName("leimaus");
	// Sortitaan sarjat ID:n mukaan, jotta saadaan ensimmäiseksi isoimmalla ID:llä oleva.
	data.sarjat.sort(function (j1,j2) {
		let jid1 = j1.id;
		let jid2 = j2.id;
		if (jid1 < jid2) {
			return 1;
		} 
		if (jid1 > jid2) {
			return -1;
		}
		return 0;
	});
	uusin_sarja_id = data.sarjat[0].id + 1;
	
	// Luodaan tietorakenteen mukaan sarjat ja lisätään 5 jäsen-inputtia
	luo_lomake_sarjat();
	luo_joukkueen_sarjat();
	luo_jasen_kenttia(5);
	lisaa_rasti_rivi();
	luo_lomake_kisa();
	
	/* Lajitellaan joukkueet ID:n mukaan jotta saadaan ensimmäiseksi yksilö jolla on suurin ID */
	data.joukkueet.sort(function (j1,j2) {
		let jid1 = j1.id;
		let jid2 = j2.id;
		if (jid1 < jid2) {
			return 1;
		} 
		if (jid1 > jid2) {
			return -1;
		}
		return 0;
	});
	
	uusin_id = data.joukkueet[0].id + 1;
	
	// Lisätään joukkueen nimen kenttään tarkastin
	jNimi.addEventListener("input", tarkasta_joukkueen_nimi);
	// Firefoxissa ei toimi datetime-local, joten tarkastetaan maximi omin kätösin.
	luontiAika.addEventListener("input", tarkasta_luontiaika);
	
	// Lisätään leimaustyypeille eventlisteneri jolla katsotaan että vähintään 1 on valittuna.
	for (let i = 0; i < leimaus.length; i++) {
		leimaus[i].addEventListener('click', laske_valitut);
	}
	
	// Lisätään tallennusnappiin joukkueen lisäämisfunktio.
	nappi.addEventListener("click", lisaa_joukkue);
	
	// Listataan lopuksi joukkueet UL elementtiin.
	let joukkuelista = document.createElement("ul");
	// ID siksi että listaan pääsee helpommin käsiksi.
	joukkuelista.setAttribute("id","joukkuelista");
	// Käydään läpi kaikki joukkueet ja lisäillään elementti jossa on vaadittavat tiedot
	for (let i = 0; i < data.joukkueet.length; i++) {
		let listaelementti = document.createElement("li");
		listaelementti.textContent = data.joukkueet[i].nimi;
		listaelementti.addEventListener("click",muuta_joukkueen_muokkaukseksi);
		joukkuelista.appendChild(listaelementti);
	}
	// Lisätään lopuksi otsikko ja div container jotta saadaan aseteltua flexillä hyvin listaus.
	let otsikko = document.createElement("h1");
	otsikko.textContent = "Joukkueet";
	let sisalto = document.createElement("div");
	sisalto.setAttribute("class","sisalto");
	sisalto.setAttribute("id","joukkue_div");
	sisalto.appendChild(otsikko);
	sisalto.appendChild(joukkuelista);
	// Tämä lisää valmiina olemassa olevan ENSIMMÄISEN sisalto -containerin eteen uuden vastaluodun containerin. 
	document.getElementsByClassName("sisalto")[0].parentNode.insertBefore(sisalto,document.getElementsByClassName("sisalto")[0]);
}

/* function paivita_kisa_tietorakenne()
* -------------------------------------------------------------------
*	Päivittää kisan tietorakenteen toimimaan arrayna, jossa jokainen
*	alkio sisältää saman kuin nykyisessä kisatiedot -objektissa.
*/
function paivita_kisa_tietorakenne() {
	let kisatiedot_nyk = data.kisatiedot;
	data.kisatiedot = [];
	data.kisatiedot.push(kisatiedot_nyk);
	uusin_kisa_id = kisatiedot_nyk.id + 1;
}

/* function paivita_kentat_kisaan() 
* -------------------------------------------------------------------
*	Päivittää sarjan alku- ja loppuaika elementtien min ja max 
*	täsmäämään valitun kisan min ja max.
*/
function paivita_kentat_kisaan() {
	let kisa = document.getElementById("kisa");
	let val_k_id = kisa[kisa.selectedIndex].value;
	let oik_data;
	for (let i = 0; i < data.kisatiedot.length; i++) {
		if (data.kisatiedot[i].id === parseInt(val_k_id)) {
			oik_data = i; break;
		}
	}
	
	let alku = document.getElementById("s_alku");
	alku.setAttribute("min",data.kisatiedot[oik_data].alkuaika.replace(" ","T"));
	alku.setAttribute("max",data.kisatiedot[oik_data].alkuaika.replace(" ","T"));
	
	let loppu = document.getElementById("s_loppu");
	loppu.setAttribute("min",data.kisatiedot[oik_data].alkuaika.replace(" ","T"));
	loppu.setAttribute("max",data.kisatiedot[oik_data].alkuaika.replace(" ","T"));
	
}

/* function luo_lomake_kisa()
* -------------------------------------------------------------------
*	Luo lomakkeen jolla voi lisätä kisoja.
*/
function luo_lomake_kisa() {
	let lomake = document.createElement("form");
	lomake.setAttribute("action","form.example");
	lomake.setAttribute("method","post");
	
	let otsikko = document.createElement("h2");
	otsikko.textContent = "Lisää kilpailu";
	lomake.appendChild(otsikko);
	
	let fs = document.createElement("fieldset");
	let legend = document.createElement("legend");
	legend.textContent = "Kilpailun tiedot";
	fs.appendChild(legend);
	
	let elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	
	let lappu = document.createElement("label");
	lappu.setAttribute("for","kisan_nimi");
	lappu.textContent = "Nimi";
	elem.appendChild(lappu);
	
	let input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("id","kisan_nimi");
	input.setAttribute("required","true");
	input.addEventListener("input",tarkasta_kisan_nimi);
	elem.appendChild(input);
	
	fs.appendChild(elem);
	
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","k_alku");
	lappu.textContent = "Alkuaika";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","k_alku");
	// Asetetaan tyyppi datetime-localiksi, mutta laitetaan siihen pattern, sillä firefox ei tunne datetime-local:ia.
	input.setAttribute("type","datetime-local");
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	input.setAttribute("required",true);
	elem.appendChild(input);
	fs.appendChild(elem);
	
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","k_loppu");
	lappu.textContent = "Loppuaika";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","k_loppu");
	// Asetetaan tyyppi datetime-localiksi, mutta laitetaan siihen pattern, sillä firefox ei tunne datetime-local:ia.
	input.setAttribute("type","datetime-local");
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	input.setAttribute("required",true);
	elem.appendChild(input);
	fs.appendChild(elem);
	
	// KESTO, vähintään 1
	// En usko tämän enää tarvitsevan ihmeempää selitystä, sillä tämä ei paljoa eroa edellisistä elementeistä.
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","k_kesto");
	lappu.textContent = "Kesto";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","k_kesto");
	input.setAttribute("type","number");
	// Vaaditaan käyttäjältä, että keston täytyy olla vähintään 1 ja kestolla täytyy olla arvo, jotta se olisi vähintään 1.
	// Asetetaan vielä oletukseksi 1.
	input.setAttribute("min",1);
	input.setAttribute("value",1);
	input.setAttribute("required","true");
	elem.appendChild(input);
	fs.appendChild(elem);
	
	lomake.appendChild(fs);
	
	let tallennaNappi = document.createElement("button");
	tallennaNappi.setAttribute("name","tallenna");
	tallennaNappi.setAttribute("type","submit");
	tallennaNappi.textContent = "Tallenna";
	
	tallennaNappi.addEventListener("click",lisaa_kisa);
	
	lomake.appendChild(tallennaNappi);
	
	
	// Etsitään oikea väli, johon lisätään uusi lomake (OIKEA VÄLI ON ENNEN "Lisää sarja"-Lomaketta.)
	let h2t = document.getElementsByTagName("h2");
	let vanha;
	for (let i = 0; i < h2t.length; i++) {
		if (h2t[i].textContent === "Lisää sarja") {
			vanha = h2t[i].parentElement;
		}
	}
	vanha.parentNode.insertBefore(lomake, vanha);
}

/* function tarkasta_kisan_nimi(e) 
* -------------------------------------------------------------------
*	Tarkastaa että kisan nimi on uniikki. Ilmoittaa virheestä lomake-
*	elementissä.
*/
function tarkasta_kisan_nimi(e) {
	let nimi = e.target;
	let pass = true;
	for (let i = 0; i < data.kisatiedot.length; i++) {
		if (data.kisatiedot[i].nimi === nimi.value) {
			pass = false;
		}
	}
	if (!pass) {
		nimi.setCustomValidity("Kisan nimen tulee olla uniikki.");
		nimi.reportValidity();
	} else {
		nimi.setCustomValidity("");
	}
}

/* function lisaa_kisa(e)
* -------------------------------------------------------------------
*	Lisää uuden kisan tietorakenteeseen, sekä sarjanlisäyslomakkeen
*	select -elementtiin. Tarkastaa samalla kisalomakkeen tiedot.
*/
function lisaa_kisa(e) {
	e.preventDefault();
	// Tarkastetaan, että lomake on varmasti täytetty oikein.
	document.forms[0].reportValidity();
	if (document.forms[0].checkValidity()) {
		// Lisätään sarja-lomakkeen kisa-valikkoon uusi vaihtoehto
		let sarjan_kisa_input = document.getElementById("kisa");
		let optio = document.createElement("option");
		optio.setAttribute("value",uusin_kisa_id);
		optio.textContent = document.getElementById("kisan_nimi").value;
		sarjan_kisa_input.appendChild(optio);
		// Lisätään tietorakenteeseen uusi kisa.
		data.kisatiedot.push({
			alkuaika: document.getElementById("k_alku").value.replace("T"," "),
			id: uusin_kisa_id,
			kesto: document.getElementById("k_kesto").value,
			loppuaika: document.getElementById("k_loppu").value.replace("T"," "),
			nimi: document.getElementById("kisan_nimi").value
		});
		uusin_kisa_id++;
		// Tyhjennetään lomake.
		document.getElementById("k_alku").value = "";
		document.getElementById("k_loppu").value = "";
		document.getElementById("kisan_nimi").value = "";
		document.getElementById("k_kesto").value = 1;
	}
}

/* function muuta_joukkueen_muokkaukseksi(e)
* -------------------------------------------------------------------
*	Muuttaa joukkue-lomakkeen toimimaan joukkueen muokkaukseen.
*/
function muuta_joukkueen_muokkaukseksi(e) {
	// Otetaan talteen ketä klikattiin ja etsitään data.joukkueet -rakenteesta oikea joukkue.
	let joukkue = e.target;
	li_edit = joukkue;
	let oik_data;
	for (let i = 0; i < data.joukkueet.length; i++) {
		if (data.joukkueet[i].nimi === joukkue.textContent) {
			oik_data = i; break;
		}
	}
	
	joukkue_edit = oik_data;
	
	//Asetetaan joukkuelomakkeeseen nimi ja aika oikein.
	document.getElementById("jNimi").value = data.joukkueet[oik_data].nimi;
	document.getElementById("luontiAika").value = data.joukkueet[oik_data].luontiaika.replace(" ","T").substring(0,16);
	// Asetetaan joukkueen leimaukset
	for (let i = 0; i < leimaus.length; i++) {
		let loytyi = false;
		for (let j = 0; j < data.joukkueet[oik_data].leimaustapa.length; j++) {
			if (leimaus[i].getAttribute("value") === data.joukkueet[oik_data].leimaustapa[j]) {
				loytyi = true;
			}
		}
		if (loytyi)
			leimaus[i].checked = true;
		else
			leimaus[i].checked = false;
	}
	// Jos sarjoja on enintään 4 niin sarja-input on radio-nappeina, jolloin joudutaan looppaamaan ne läpi
	if (data.sarjat.length <= 4) {
		for (let i = 0; i < sarja.length; i++) {
			if (parseInt(sarja[i].getAttribute("value")) === parseInt(data.joukkueet[oik_data].sarja))
				sarja[i].checked = true;
			else
				sarja[i].checked = false;
		}
	} else { // Kun sarjoja on enemmän kuin 4 niin voidaan asettaa select elementille value.
		sarja.value = data.joukkueet[oik_data].sarja;
	}
	// Haetaan jäsenten tiedot ja varmistetaan vielä ettei lisäillä enempää jäseniä kuin on tarkoitus.
	for (let i = 0; i < data.joukkueet[oik_data].jasenet.length; i++) {
		if (i < jasenet.length)
			jasenet[i].value = data.joukkueet[oik_data].jasenet[i];
	}
	
	// Tyhjennetään leimattujen rastien taulu ja lisätään sinne yksi uusi tyhjä rivi, jotta käyttäjä voi luoda taas uuden joukkueen uusilla rastitiedoilla
	let taulu = document.getElementById("rastitaulu");
	while(taulu.firstChild) {
		taulu.removeChild(taulu.firstChild);
	}
	
	// Taulun tyhjennys poisti otsikotkin, joten luodaan ne takaisin.
	let tr = document.createElement("tr");
	let th = document.createElement("th");
	th.textContent = "Rasti";
	tr.appendChild(th);
	th = document.createElement("th");
	th.textContent = "Aika";
	tr.appendChild(th);
	th = document.createElement("th");
	th.textContent = "Poista";
	tr.appendChild(th);
	taulu.appendChild(tr);
	// Lisätään esitäytettyjä rivejä joukkueen rasteista.
	for (let i = 0; i < data.joukkueet[oik_data].rastit.length; i++) {
		syota_rasti_rivi(data.joukkueet[oik_data].rastit[i].id,data.joukkueet[oik_data].rastit[i].aika);
	}
	// Lisätään vielä tyhjä rivi jotta käyttäjä voi lisätä itse rasteja lisää.
	lisaa_rasti_rivi();
}


/* function syota_rasti_rivi()
* -------------------------------------------------------------------
*	Luo uuden rasti-rivin rastien leimaustauluun annetuilla arvoilla.
*/
function syota_rasti_rivi(rid,aika) {
	// Haetaan taulu ja luodaan tyhjät tr ja td elementit
	let table = document.getElementById("rastitaulu");
	let rivi = document.createElement("tr");
	let sarake = document.createElement("td");
	// Muunnetaan rasti.id -> rasti.koodi
	let oik_koodi;
	for (let i = 0; i < data.rastit.length; i++) {
		if (parseInt(rid) === data.rastit[i].id) 
			oik_koodi = data.rastit[i].koodi;
	}
	
	
	// Haetaan jo valitut rastit, sekä luodaan input+datalist
	let syotteet = table.getElementsByClassName("rastileimat");
	let syottokentta = document.createElement("input");
	syottokentta.setAttribute("list","L"+(table.getElementsByTagName("tr").length));
	syottokentta.setAttribute("type","text");
	syottokentta.setAttribute("class","rastileimat");
	syottokentta.setAttribute("value",oik_koodi);
	let valikko = document.createElement("datalist");
	valikko.setAttribute("id","L"+(table.getElementsByTagName("tr").length));
	
	// Käydään rastit läpi, läpikäynneillä katsotaan myös olemassaolevia rivejä ja niiden arvoja
	for (let i = 0; i < data.rastit.length; i++) {
		let lisaa = true;
		// Katsotaan löytyykö syötettä jo taulusta, jos löytyy niin ei lisätä sitä datalistiin.
		for (let j = 0; j < syotteet.length; j++) {
			if (String(syotteet[j].value) === data.rastit[i].koodi) {
				lisaa = false;
			}
		}
		if (lisaa) {
			let optio = document.createElement("option");
			optio.setAttribute("value",data.rastit[i].koodi);
			optio.textContent = data.rastit[i].koodi;
			valikko.appendChild(optio);
		}
	}
	// Käydään olemassaolevat datalistit läpi ja poistetaan niistä inputien arvot.
	for (let i = 0; i < syotteet.length; i++) {
		let kasiteltavat = [];
		if (syotteet[i] !== syottokentta)
			kasiteltavat = document.getElementById(syotteet[i].getAttribute("list"));
		for (let j = 0; j < kasiteltavat.options.length; j++) {
			if (kasiteltavat.options[j].value === syottokentta.value) {
				kasiteltavat.removeChild(kasiteltavat.options[j]); 
				break;
			}
		}
	}
	// Valinnan muuttuessa kutsutaan funktiota, joka poistaa muista datalisteistä uuden valinnan
	syottokentta.addEventListener("blur",muuta_rastivalintoja);
	// Lisätään vielä luotu valikko sarakkeeseen, joka lisätään riviin
	sarake.appendChild(syottokentta);
	sarake.appendChild(valikko);
	rivi.appendChild(sarake);
	// Luodaan uusi sarake, johon tulee tälläkertaa leimauksen aika -kenttä
	sarake = document.createElement("td");
	let input = document.createElement("input");
	input.setAttribute("value",aika.replace(" ","T").substring(0,16));
	// Tyyppi datetime-localiksi ja laitetaan pattern, jotta firefox:kin ymmärtää millaista dataa haetaan.
	input.setAttribute("type","datetime-local");
	input.setAttribute("id","a"+table.getElementsByTagName("tr").length);
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	input.addEventListener("blur",tarkasta_leimaus_aika);
	sarake.appendChild(input);
	rivi.appendChild(sarake);
	// Lopuksi vielä riville tarvitaan rivin poistoon erikoistunut checkbox.
	sarake = document.createElement("td");
	input = document.createElement("input");
	input.setAttribute("type","checkbox");
	input.setAttribute("id","c"+table.getElementsByTagName("tr").length);
	input.addEventListener("click",poista_leimaus_rivi);
	sarake.appendChild(input);
	rivi.appendChild(sarake);
	table.appendChild(rivi);
}

/* function lisaa_joukkue(e)
* -------------------------------------------------------------------
*	Tarkastaa joukkueen tiedot lomakkeelta ja lisää joukkueen 
*	tietorakenteeseen sekä joukkuelistaukseen.
*/
function lisaa_joukkue(e) {
	// Estetään oletustoiminto (eli tässä tapauksessa sivun lataus form.example -osoitteeseen)
	e.preventDefault();
	
	// Tarkistaa vielä erikoissäännöt kentille
	laske_valitut();
	laske_sarjat();
	tarkasta_jasenet();
	
	// Käydään lomakkeen data läpi ja valitetaan jos on valitettavaa
	for ( let o of document.forms[2] ) {
		let v  = o.checkValidity();
		o.reportValidity();
	}
	// Ilmoitetaan löydöksistä.
	document.forms[2].reportValidity();
	// Jos lomakkeen data oli oikein niin haetaan joukkueen data lomakkeelta.
	if (document.forms[2].checkValidity()) {
		if (joukkue_edit === -1) {
		// Kerätään jäsen dataan kaikkien niiden jäsenten nimet, joiden arvo ei ole tyhjä.
			let jasen_data = [];
			for (let i = 0; i < jasenet.length; i++) {
				if (jasenet[i].value !== "") {
					jasen_data.push(jasenet[i].value);
				}
			}
			// Haetaan leimaustavat joukkueelle
			let leimaus_tapa = [];
			for (let i = 0; i < leimaus.length; i++) {
				if (leimaus[i].checked) {
					leimaus_tapa.push(leimaus[i].value);
				}
			}
			// Haetaan joukkueen sarja
			let j_sarja;
			// Muistetaan kurkistaa onko sarjat radiona vai selectinä
			if (data.sarjat.length <= 4) {
				for (let i = 0; i < sarja.length; i++) {
					if (sarja[i].checked) {
						j_sarja = sarja[i].value;
						break;
					}
				}
			} else {
				j_sarja = sarja[sarja.selectedIndex].value;
			}
			// Haetaan joukkueen leimatut rastit
			let leimatut = [];
			let merkatut = document.getElementById("rastitaulu").getElementsByTagName("tr");
			for (let i = 1; i < merkatut.length; i++) {
				if (merkatut[i].getElementsByClassName("rastileimat")[0] !== undefined && merkatut[i].getElementsByClassName("rastileimat")[0].value !== "") {
					let merkattu_rasti;
					for (let j = 0; j < data.rastit.length; j++) {
						if (data.rastit[j].koodi === merkatut[i].getElementsByClassName("rastileimat")[0].value) {
							merkattu_rasti = data.rastit[j].id;
							break;
						}
					}
					let merkattu_aika = merkatut[i].getElementsByTagName("input")[1].value;
					leimatut.push({
						aika: merkattu_aika.replace("T"," "),
						id: merkattu_rasti
					});
				}
			}
			// Lisätään data.joukkueet -tietorakenteeseen uusi joukkue
			data.joukkueet.push({
				id: uusin_id,
				jasenet: jasen_data,
				leimaustapa: leimaus_tapa,
				luontiaika: document.getElementById("luontiAika").value.replace("T"," "),
				matka: 0,
				nimi: document.getElementById("jNimi").value,
				rastit: leimatut,
				sarja: j_sarja,
				seura: null
			});
			// Korotetaan haettua ID:tä yhdellä, jolloin seuraava joukkue saa taas uniikin ID:n
			uusin_id++;
			
			// Lisätään joukkuelista elementtiin uusi joukkue
			let lista = document.getElementById("joukkuelista");
			let li = document.createElement("li");
			li.textContent = document.getElementById("jNimi").value;
			lista.appendChild(li);
			// Tyhjennetään leimattujen rastien taulu ja lisätään sinne yksi uusi tyhjä rivi, jotta käyttäjä voi luoda taas uuden joukkueen uusilla rastitiedoilla
			let taulu = document.getElementById("rastitaulu");
			while(taulu.firstChild) {
				taulu.removeChild(taulu.firstChild);
			}
			
			let tr = document.createElement("tr");
			let th = document.createElement("th");
			th.textContent = "Rasti";
			tr.appendChild(th);
			th = document.createElement("th");
			th.textContent = "Aika";
			tr.appendChild(th);
			th = document.createElement("th");
			th.textContent = "Poista";
			tr.appendChild(th);
			taulu.appendChild(tr);
			lisaa_rasti_rivi();
			
			// Lopuksi vielä siistitään joukkuelomake
			tyhjenna_joukkue_lomake();
		}
		else { // Jos kyseessä onkin muokkaus niin seuraa seuraavaa
			// Päivitetään joukkuenimi listaan että tietorakenteeseen.
			data.joukkueet[joukkue_edit].nimi = document.getElementById("jNimi").value;
			li_edit.textContent = document.getElementById("jNimi").value;
			//Päivitetään tietorakenteeseen luomisaika
			data.joukkueet[joukkue_edit].luontiaika = document.getElementById("luontiAika").value.replace("T"," ");
			
			
			// Haetaan joukkueen leimatut rastit
			let leimatut = [];
			let merkatut = document.getElementById("rastitaulu").getElementsByTagName("tr");
			for (let i = 1; i < merkatut.length; i++) {
				// Muistetaan katsoa ettei kyseessä ole olemassaolematon tai tyhjä.
				if (merkatut[i].getElementsByClassName("rastileimat")[0] !== undefined && merkatut[i].getElementsByClassName("rastileimat")[0].value !== "") {
					let merkattu_rasti;
					// Haetaan oikea ID rastikoodin perusteella.
					for (let j = 0; j < data.rastit.length; j++) {
						if (data.rastit[j].koodi === merkatut[i].getElementsByClassName("rastileimat")[0].value) {
							merkattu_rasti = data.rastit[j].id;
							break; // Oikea löytyi joten turha jatkaa looppia.
						}
					}
					// Rakennetaan rastilista.
					let merkattu_aika = merkatut[i].getElementsByTagName("input")[1].value;
					leimatut.push({
						aika: merkattu_aika.replace("T"," "),
						id: merkattu_rasti
					});
				}
			}
			// Vaihdetaan kyseisen joukkueen olemassa oleva lista uuteen listaan rasteja.
			data.joukkueet[joukkue_edit].rastit = leimatut;
			// Haetaan joukkueen sarja, muistetaan katsoa onko radio vai select
			let j_sarja;
			if (data.sarjat.length <= 4) {
				for (let i = 0; i < sarja.length; i++) {
					if (sarja[i].checked) {
						j_sarja = sarja[i].value;
						break;
					}
				}
			} else {
				j_sarja = sarja[sarja.selectedIndex].value;
			}
			// Asetetaan sarja.
			data.joukkueet[joukkue_edit].sarja = j_sarja;
			
			// Kurkitaan leimaustavat ja asetetaan ne joukkueelle.
			let leimaus_tapa = [];
			for (let i = 0; i < leimaus.length; i++) {
				if (leimaus[i].checked) {
					leimaus_tapa.push(leimaus[i].value);
				}
			}
			data.joukkueet[joukkue_edit].leimaustapa = leimaus_tapa;
			
			let jasen_data = [];
			for (let i = 0; i < jasenet.length; i++) {
				if (jasenet[i].value !== "") {
					jasen_data.push(jasenet[i].value);
				}
			}
			data.joukkueet[joukkue_edit].jasenet = jasen_data;
			
			// Asetetaan joukkue_edit -1 jotta ohjelma tietää, ettei enää editoida ketään.
			joukkue_edit = -1;
			
			// Tyhjennetään leimattujen rastien taulu ja lisätään sinne yksi uusi tyhjä rivi, jotta käyttäjä voi luoda taas uuden joukkueen uusilla rastitiedoilla
			let taulu = document.getElementById("rastitaulu");
			while(taulu.firstChild) {
				taulu.removeChild(taulu.firstChild);
			}
			// Tyhjennys poisti otsikot joten lisätään ne.
			let tr = document.createElement("tr");
			let th = document.createElement("th");
			th.textContent = "Rasti";
			tr.appendChild(th);
			th = document.createElement("th");
			th.textContent = "Aika";
			tr.appendChild(th);
			th = document.createElement("th");
			th.textContent = "Poista";
			tr.appendChild(th);
			taulu.appendChild(tr);
			// Lisätään tyhjä rasti rivi.
			lisaa_rasti_rivi();
			
			// Lopuksi vielä siistitään joukkuelomake
			tyhjenna_joukkue_lomake();
			console.log(data);
		}
	} else {
		// JOS VIRHETILANTEESSA TÄYTYY TEHDÄ JOTAIN, SIJOITA TÄHÄN
	}

}


/* function lisaa_rasti_rivi()
* -------------------------------------------------------------------
*	Lisää joukkuelomakkeen leimattujen rastien tauluuun uuden tyhjän
*	rivin.
*/
function lisaa_rasti_rivi() {
	// Haetaan taulu ja luodaan tyhjät tr ja td elementit
	let table = document.getElementById("rastitaulu");
	let rivi = document.createElement("tr");
	let sarake = document.createElement("td");
	
	// Haetaan jo valitut rastit, sekä luodaan uusi datalist+input
	let syotteet = table.getElementsByClassName("rastileimat");
	let syottokentta = document.createElement("input");
	syottokentta.setAttribute("list","L"+(table.getElementsByTagName("tr").length));
	syottokentta.setAttribute("type","text");
	syottokentta.setAttribute("class","rastileimat");
	let valikko = document.createElement("datalist");
	valikko.setAttribute("id","L"+(table.getElementsByTagName("tr").length));
	// About sama toiminta kuin edellisessä rastirivin lisäämisessä.
	// Eli katsotaan onko jossain inputissa kyseistä koodia, jos on niin ei lisätä datalistiin sitä rastia.
	for (let i = 0; i < data.rastit.length; i++) {
		let lisaa = true;
		for (let j = 0; j < syotteet.length; j++) {
			if (String(syotteet[j].value) === data.rastit[i].koodi) {
				lisaa = false;
			}
		}
		if (lisaa) {
			let optio = document.createElement("option");
			optio.setAttribute("value",data.rastit[i].koodi);
			valikko.appendChild(optio);
		}
	}
	// Käydään olemassaolevat datalistit läpi ja poistetaan niistä oletusvalinnan arvot.
	for (let i = 0; i < syotteet.length; i++) {
		let kasiteltavat = [];
		if (syotteet[i] !== syottokentta)
			kasiteltavat = document.getElementById(syotteet[i].getAttribute("list"));
		for (let j = 0; j < kasiteltavat.options.length; j++) {
			if (kasiteltavat.options[j].value === syottokentta.value) {
				kasiteltavat.removeChild(kasiteltavat.options[j]); 
				break;
			}
		}
	}
	// Valinnan muuttuessa kutsutaan funktiota, joka muuttaa muista datalisteistä uuden valinnan
	syottokentta.addEventListener("blur",muuta_rastivalintoja);
	// Lisätään vielä luotu valikko sarakkeeseen, joka lisätään riviin
	sarake.appendChild(syottokentta);
	sarake.appendChild(valikko);
	rivi.appendChild(sarake);
	// Luodaan uusi sarake, johon tulee tälläkertaa leimauksen aika -kenttä
	sarake = document.createElement("td");
	let input = document.createElement("input");
	// Tyyppi datetime-localiksi ja laitetaan pattern, jotta firefox:kin ymmärtää millaista dataa haetaan.
	input.setAttribute("type","datetime-local");
	input.setAttribute("id","a"+table.getElementsByTagName("tr").length);
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	input.addEventListener("blur",tarkasta_leimaus_aika);
	sarake.appendChild(input);
	rivi.appendChild(sarake);
	// Lopuksi vielä riville tarvitaan rivin poistoon erikoistunut checkbox.
	sarake = document.createElement("td");
	input = document.createElement("input");
	input.setAttribute("type","checkbox");
	input.setAttribute("id","c"+table.getElementsByTagName("tr").length);
	input.addEventListener("click",poista_leimaus_rivi);
	sarake.appendChild(input);
	rivi.appendChild(sarake);
	table.appendChild(rivi);
}


/* function poista_leimaus_rivi(e)
* -------------------------------------------------------------------
*	Poistaa klikatun esineen vanhempana toimivan TR:n taulusta.
*	Käytetään rastileimausten checkboxin klikkauseventtinä.
*/
function poista_leimaus_rivi(e) {
	// Haetaan kohde-elementti.
	let kohde = e.target;
	// Haetaan kaikki rastitaulun rivit
	let rivit = document.getElementById("rastitaulu").getElementsByTagName("tr");
	// Käydään rivit läpi, jos kutsuva elementti löytyy kyseiseltä riviltä, poistetaan se rivi ja jos rivejä on vain 1 niin lisätään tyhjä rivi.
	for (let i = 0; i < rivit.length; i++) {
		if (rivit[i].contains(kohde)) {
			rivit[i].parentNode.removeChild(rivit[i]);
			if (rivit.length === 1) {
				lisaa_rasti_rivi();
			}
			break;
		}
	}
}

/* function muuta_rastivalintoja(e)
* -------------------------------------------------------------------
*	Käy kaikki rastileimaukset läpi ja rakentaa ne uusiksi sen tiedon
*	perusteella mitä on valittuna. 
*/
function muuta_rastivalintoja(e) {
	// Otetaan muistiin kuka muuttuu, sekä koodin selkeyttämiseksi taulu
	let muuttunut = e.target;
	let table = document.getElementById("rastitaulu");
	// Otetaan talteen myös kaikki datalistit.
	let syotteet = table.getElementsByClassName("rastileimat");
	
	// Kerätään ensin talteen kaikki valittuna olleet arvot
	let valitut_arvot = [];
	for (let i = 0; i < syotteet.length; i++) {
		let valittu = syotteet[i];
		valitut_arvot.push(valittu.value);
	}
	// Käydään syötteet uusiksi läpi
	for (let i = 0; i < syotteet.length; i++) {
		// Skipataan muutos jottei poistettaisi valittuakin elementtiä.
		if (syotteet[i] === muuttunut)
			continue;
		// Otetaan talteen se option joka oli valittuna
		let iteroitava = document.getElementById(syotteet[i].getAttribute("list"));
		let valittu = syotteet[i].value;
		// Poistetaan kaikki optionit
		while (iteroitava.firstChild) {
			iteroitava.removeChild(iteroitava.firstChild);
		}
		// Kootaan optionit uudelleen datalistiin.
		// Tämän periaate: Rastin voi lisätä, kunhan se ei löydy valituista rasteista, paitsi silloin jos kyseessä on elementin oma valittu rasti.
		for (let j = 0; j < data.rastit.length; j++) {
			let lisaa = true;
			for (let k = 0; k < valitut_arvot.length; k++) {
				if (valitut_arvot[k] === data.rastit[j].koodi && valitut_arvot[k] !== valittu ) {
					lisaa = false;
				}
			}
			if (lisaa) {
				// Valitsematon rasti lisätään elementtiin ja asetetaan se valinnaksi, jos kyseinen rasti oli select-elementin valinta
				let optio = document.createElement("option");
					optio.setAttribute("value",data.rastit[j].koodi);
				optio.textContent = data.rastit[j].koodi;
				iteroitava.appendChild(optio);
			}
		}
	}
	let rasti_flag = false;
	let datalista = document.getElementById(muuttunut.getAttribute("list"));
	for (let i = 0; i < datalista.options.length; i++) {
		if (muuttunut.value === datalista.options[i].value) {
			rasti_flag = true;
		}
	}
	if (rasti_flag) {
		muuttunut.setCustomValidity("");
	} else {
		muuttunut.setCustomValidity("Rastin tulee löytyä annetusta listasta");
		muuttunut.reportValidity();
	}
}


/* function tarkasta_leimaus_aika(e)
* -------------------------------------------------------------------
*	Tarkastetaan leimatun rastin leimausaika.
*/
function tarkasta_leimaus_aika(e) {
	// Rastin leimausaika saa olla vain sarjan alku- ja loppuajan väliltä. 
	//Jos sarjalle ei ole annettu alku- tai loppuaikaa, niin käytetään kilpailun alku- ja loppuaikaa
	
	// Haetaan ensin ylä ja alaraja
	let yla = null, ala = null;
	let oik_data = 0; // Tämä on oletuskisa
	let sarjat = document.getElementsByName("sarja");
	let valittu = undefined;
	// Katsotaan onko valittuna jotain sarjaa.
	for (let i = 0; i < sarjat.length; i++) {
		if (sarjat[i].checked) {
			valittu = sarjat[i];
			break;
		}
	}
	// Jos sarjaa ei ole valittu, käytetään kilpailun alku- sekä loppuaikaa ylä- ja alarajana
	if (valittu === undefined) {
		// katsotaan kilpailun alku- ja loppuaikaa
		yla = data.kisatiedot[oik_data].loppuaika;
		ala = data.kisatiedot[oik_data].alkuaika;
	} else {
		// Katsotaan onko sarjalle asetettu alku ja loppuaikaa
		for (let j = 0; j < data.sarjat.length; j++) {
			if (data.sarjat[j].id === parseInt(valittu.value)) {
				if (data.sarjat[j].alkuaika !== null) 
					ala = data.sarjat[j].alkuaika;
				if (data.sarjat[j].loppuaika !== null) 
					yla = data.sarjat[j].loppuaika;
				let kisa = data.sarjat[j].kilpailu;
				break;
			}
		}
		for (let i = 0; i < data.kisatiedot.length; i++) {
			if (String(data.kisatiedot[i].id) === String(kisa)) { // Jos kisa onkin jokin muu kuin oletus niin muutetaan yla ja ala täsmäämään.
				yla = data.kisatiedot[i].loppuaika;
				ala = data.kisatiedot[i].alkuaika;
				break;
			}
		}
		// Jos sarjalle ei ole asetettu ylä- tai alarajaa, haetaan se kisatiedoista
		if (yla === null)
			yla = data.kisatiedot[oik_data].loppuaika;
		if (ala === null)
			ala = data.kisatiedot[oik_data].alkuaika;
	}
	// Muutetaan rajat ja vertailtava aika Dateksi, jotta voidaan vertailla sitä < ja > vertailuoperaattoreilla
	let alkudate = new Date(ala.replace(" ","T"));
	let loppudate = new Date(yla.replace(" ","T"));
	let vertailtava = new Date(e.target.value);
	if (vertailtava < alkudate || vertailtava > loppudate) {
		// Jos aika on määrättyjen arvojen ulkopuolella, valitetaan siitä käyttäjälle.
		e.target.setCustomValidity("Leimausajan tulee olla väliltä: \n" + ala + " -\n" + yla);
		e.target.reportValidity();
	} else {
		// Jos aika on sallittujen rajojen sisäpuolella, tyhjennetään valitus.
		e.target.setCustomValidity("");
	}
	// Lisätään tyhjä rivi, jos tarve vaatii.
	let table = document.getElementById("rastitaulu");
	let ajat = table.querySelectorAll("input[type=datetime-local]");
	let tarvitaan_uutta = true;
	for (let i = 0; i < ajat.length; i++) {
		if (ajat[i].value === "") {
			// Jos kaikki aika-kentät ovat täynnä, niin tarvitaan uutta, jos jokin aika-kenttä on tyhjä niin oletetaan että käyttäjä ei tarvitse uutta riviä.
			tarvitaan_uutta = false;
		}
	}
	if (tarvitaan_uutta)
		lisaa_rasti_rivi();
}


/* function luo_lomake_sarjat()
* -------------------------------------------------------------------
*	Luo lomakkeen, jolla voidaan lisätä tietorakenteeseen uuden sarjan.
*/
function luo_lomake_sarjat() {
	// Luodaan tyhjä lomake
	let lomake = document.createElement("form");
	lomake.setAttribute("action","form.example");
	lomake.setAttribute("method","post");
	// luodaan otsikko lomakkeelle.
	let otsikko = document.createElement("h2");
	otsikko.textContent = "Lisää sarja";
	lomake.appendChild(otsikko);
	// Luodaan fieldset johon lisätään inputit
	let fs = document.createElement("fieldset");
	let legend = document.createElement("legend");
	legend.textContent = "Sarjan tiedot";
	fs.appendChild(legend);
	
	// NIMI, ei saa olla tyhjä eikä saa olla kahta samannimistä sarjaa
	// Luodaan ensin elementti, johon laitetaan LABEL ja INPUT.
	let elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	let lappu = document.createElement("label");
	lappu.setAttribute("for","sNimi");
	lappu.textContent = "Nimi";
	elem.appendChild(lappu);
	let input = document.createElement("input");
	input.setAttribute("id","sNimi");
	input.setAttribute("type","text");
	// Koska nimi ei saa olla tyhjä, sitä vaaditaan silloin käyttäjältä.
	input.setAttribute("required","true");
	// Pistetään input katselemaan, antaako käyttäjä varmasti uniikkia sarjan nimeä
	input.addEventListener("input", tarkasta_sarjan_nimi);
	elem.appendChild(input);
	// Lisätään lopuksi vielä elementti labelineen ja inputtineen fieldsettiin
	fs.appendChild(elem);
	
	// ALKUAIKA, saa olla tyhjä, ei saa olla ennen tai jälkeen kilpailuajan
	// Tämä toimii suhteellisen paljon samalla tavalla kuin edellinenkin...
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","s_alku");
	lappu.textContent = "Alkuaika";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","s_alku");
	// Asetetaan tyyppi datetime-localiksi, mutta laitetaan siihen pattern, sillä firefox ei tunne datetime-local:ia.
	input.setAttribute("type","datetime-local");
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	// Chrome ymmärtää min ja max -attribuutit, joten annetaan chromelle tieto niistä, mutta lisätään firefoxin vuoksi eventlisteneri jolla tarkastetaan aika.
	input.setAttribute("min",data.kisatiedot[0].alkuaika.replace(" ","T"));
	input.setAttribute("max",data.kisatiedot[0].loppuaika.replace(" ","T"));
	input.addEventListener("input", tarkasta_sarjan_aika);
	elem.appendChild(input);
	fs.appendChild(elem);
	
	// LOPPUAIKA, saa olla tyhjä, ei saa olla ennen tai jälkeen kilpailuajan
	// Toimii täysin samoin tavoin kuin edellinenkin elementti.
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","s_loppu");
	lappu.textContent = "Loppuaika";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","s_loppu");
	input.setAttribute("type","datetime-local");
	input.setAttribute("pattern","[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}");
	input.setAttribute("min",data.kisatiedot[0].alkuaika.replace(" ","T"));
	input.setAttribute("max",data.kisatiedot[0].loppuaika.replace(" ","T"));
	input.addEventListener("input", tarkasta_sarjan_aika);
	elem.appendChild(input);
	fs.appendChild(elem);
	// KESTO, vähintään 1
	// En usko tämän enää tarvitsevan ihmeempää selitystä, sillä tämä ei paljoa eroa edellisistä elementeistä.
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","s_kesto");
	lappu.textContent = "Kesto";
	elem.appendChild(lappu);
	input = document.createElement("input");
	input.setAttribute("id","s_kesto");
	input.setAttribute("type","number");
	// Vaaditaan käyttäjältä, että keston täytyy olla vähintään 1 ja kestolla täytyy olla arvo, jotta se olisi vähintään 1.
	// Asetetaan vielä oletukseksi 1.
	input.setAttribute("min",1);
	input.setAttribute("value",1);
	input.setAttribute("required","true");
	elem.appendChild(input);
	fs.appendChild(elem);
	// KILPAILU, alasvetovalikosta valittava
	elem = document.createElement("div");
	elem.setAttribute("class","lomake_elementti");
	lappu = document.createElement("label");
	lappu.setAttribute("for","kisa");
	lappu.textContent = "Kilpailu";
	elem.appendChild(lappu);
	let pudotusvalikko = document.createElement("select");
	pudotusvalikko.setAttribute("id","kisa");
	pudotusvalikko.setAttribute("name","kisa");
	pudotusvalikko.addEventListener("blur",paivita_kentat_kisaan);
	// Jos kisoja olisi enemmän, niin tähän saisi tehtyä helposti FOR-loopin eri kisoille.
	for (let i = 0; i < data.kisatiedot.length; i++) {
		let optio = document.createElement("option");
		optio.setAttribute("value",data.kisatiedot[i].id);
		optio.setAttribute("selected","true");
		optio.textContent = data.kisatiedot[i].nimi;
		pudotusvalikko.appendChild(optio);
	}
	elem.appendChild(pudotusvalikko);
	fs.appendChild(elem);
	// Lisätään fieldset vielä uuteen lomakkeeseen, laitetaan lomakkeelle sen jälkeen vielä tallenna-nappi.
	lomake.appendChild(fs);
	let tallennaNappi = document.createElement("button");
	tallennaNappi.setAttribute("name","tallenna");
	tallennaNappi.setAttribute("type","submit");
	tallennaNappi.textContent = "Tallenna";
	
	tallennaNappi.addEventListener("click",paivita_sarjat);
	
	lomake.appendChild(tallennaNappi);
	
	// Etsitään oikea väli, johon lisätään uusi lomake (OIKEA VÄLI ON ENNEN "Lisää joukkue"-Lomaketta.)
	let h2t = document.getElementsByTagName("h2");
	let vanha;
	for (let i = 0; i < h2t.length; i++) {
		if (h2t[i].textContent === "Lisää joukkue") {
			vanha = h2t[i].parentElement;
		}
	}
	vanha.parentNode.insertBefore(lomake, vanha);
}


/* function paivita_sarjat(e)
* -------------------------------------------------------------------
*	Päivittää tietorakenteeseen ja joukkueen lisäämislomakkeeseen
*	uuden luodun sarjan, sekä tarkastaa sarjanlisäyslomakkeen.
*/
function paivita_sarjat(e) {
	// Estetään oletustoiminto
	e.preventDefault();
	// Tarkastetaan, että lomake on varmasti täytetty oikein.
	document.forms[1].reportValidity();
	if (document.forms[1].checkValidity()) {
		let kisa = document.getElementById("kisa");
		data.sarjat.push({
			alkuaika: document.getElementById("s_alku").value.replace("T"," "),
			id: uusin_sarja_id,
			kesto: document.getElementById("s_kesto").value,
			kilpailu: kisa[kisa.selectedIndex].value,
			loppuaika: document.getElementById("s_loppu").value.replace("T"," "),
			matka: document.getElementById("s_kesto").value + "h",
			nimi: document.getElementById("sNimi").value
		});
		
		let spanit = document.getElementsByTagName("span");
		let divi;
		for (let i = 0; i < spanit.length; i++) {
			if (spanit[i].textContent === "Sarja") {
				// Etsitään joukkuelomakkeen "Sarja"-kohta, johon voidaan lisätä uusi sarja.
				divi = etsi_seuraava(spanit[i],"DIV");
				break;
			}
		}
		// Jos sarjoja on 4 tai vähemmän niin tehdään radiobutton
		if (data.sarjat.length <= 4) {
			// Luodaan elementti, jolla voidaan valita uusi sarja
			let elem = document.createElement("div");
			let lappu = document.createElement("label");
			lappu.setAttribute("for",document.getElementById("sNimi").value);
			lappu.textContent = document.getElementById("sNimi").value;
			let input = document.createElement("input");
			input.setAttribute("id",document.getElementById("sNimi").value);
			input.setAttribute("name","sarja");
			input.setAttribute("value",uusin_sarja_id);
			input.setAttribute("type","radio");
			elem.appendChild(lappu);
			elem.appendChild(input);
			divi.appendChild(elem);
			// Lisätään sarjoihin uusi input.
			sarja.push(input);
		} else {
			// Muuten tyhjennetään div ja luodaan sinne select-nappi, johon laitetaan optioneiksi sarjat.
			while(divi.firstChild) {
				divi.removeChild(divi.firstChild);
			}
			let valikko = document.createElement("select");
			valikko.setAttribute("id","joukkueen_sarja");
			let optio;
			for (let i = 0; i < data.sarjat.length; i++) {
				optio = document.createElement("option");
				optio.value = data.sarjat[i].id;
				optio.textContent = data.sarjat[i].nimi;
				// Jos ollaankin jo muuttamassa joukkuetta mutta sarjojen määrä lisääntyy.
				if (joukkue_edit !== -1) {
					if (data.sarjat[i].id === data.joukkueet[joukkue_edit].sarja) { 
						optio.selected = true;
					}
				}
				valikko.appendChild(optio);
			}
			divi.appendChild(valikko);
			sarja = valikko;
		}
		// Päivitetään uuden sarjan ID -muuttuja sisältämään taas uniikin ID:n.
		uusin_sarja_id++;
		// Tyhjennetään sarjan lomake.
		document.getElementById("sNimi").value = "";
		document.getElementById("s_alku").value = "";
		document.getElementById("s_loppu").value = "";
		document.getElementById("s_kesto").value = 1;
	}
}


/* function tarkasta_sarjan_nimi(e)
* -------------------------------------------------------------------
*	Tarkastaa sarjanlisäämislomakkeesta sarjan nimen ja antaa siitä
*	virheen, jos nimi on virheellinen.
*/
function tarkasta_sarjan_nimi(e) {
	// EI SAA OLLA TYHJÄ EIKÄ SAA OLLA TOISTA SAMAN NIMISTÄ
	// haetaan nimen input muuttujaan koodin selkeyttämiseksi.
	let nimiloota = e.target;
	// Oletetaan alkuun että sarjan nimi on uniikki, jos kuitenkin ilmenee, että näin ei ole, muutetaan muuttujan arvo.
	let pass = true;
	for (var i = 0; i < data.sarjat.length; i++ ) {
		if (data.sarjat[i].nimi === nimiloota.value) {
			pass = false;
			break;
		}
	}
	if (!pass) {
		nimiloota.setCustomValidity("Sarjan nimen tulee olla uniikki!");
		nimiloota.reportValidity();
	} else if (nimiloota.value === "") {
		nimiloota.setCustomValidity("Sarjalla tulee olla nimi!");
		nimiloota.reportValidity();
	} else {
		nimiloota.setCustomValidity("");
	}
}


/* function tarkasta_sarjan_aika(e)
* -------------------------------------------------------------------
*	Tarkastaa sarjan ajan ja valittaa, jos tieto ei täsmää rajoitteita.
*/
function tarkasta_sarjan_aika(e) {
	// SAA OLLA TYHJÄ, EI SAA OLLA ENNEN KILPAILUN ALKUAIKAA EIKÄ KILPAILUN LOPPUAJAN JÄLKEEN
	let syote_aika = e.target;
	let kisa = document.getElementById("kisa");
	let val_k_id = kisa[kisa.selectedIndex].value;
	let oik_data;
	for (let i = 0; i < data.kisatiedot.length; i++) {
		if (data.kisatiedot[i].id === parseInt(val_k_id)) {
			oik_data = i; break;
		}
	}
	// Muutetaan päivämäärät Date:ksi, jotta voidaan vertailla niitä > ja < operaattoreilla.
	let verrokki_alku = new Date(data.kisatiedot[oik_data].alkuaika.replace(" ","T"));
	let verrokki_loppu = new Date(data.kisatiedot[oik_data].loppuaika.replace(" ","T"));
	let vertailtava = new Date(syote_aika.value);
	if (vertailtava <= verrokki_alku || vertailtava >= verrokki_loppu) {
		syote_aika.setCustomValidity("Luontiajan oltava väliltä: " + data.kisatiedot[oik_data].alkuaika + " - " + data.kisatiedot[oik_data].loppuaika);
		syote_aika.reportValidity();
	} else {
		syote_aika.setCustomValidity("");
	}
}


/* function tyhjenna_joukkue_lomake()
* -------------------------------------------------------------------
*	Tyhjentää joukkueenlisäämislomakkeen.
*/
function tyhjenna_joukkue_lomake() {
	let jNimi = document.getElementById("jNimi"),
		luontiAika = document.getElementById("luontiAika"),
		nappi = document.getElementsByName("tallenna")[0];
	// Nimi ja aika tyhjäksi.
	jNimi.value = "";
	luontiAika.value = "";
	// Otetaan valinnat pois leimaustavasta
	for (let i = 0; i < leimaus.length; i++) {
		leimaus[i].checked = false;
	} 
	// Otetaan valinta pois sarjoista
	if (data.sarjat.length <= 4) {
		for (let i = 0; i < sarja.length; i++) {
			sarja[i].checked = false;
		}
	}
	else {
		sarja.selectedIndex = 0;
	}
	// Tyhjennetään jäsenkenttien arvot.
	for (let i = 0; i < jasenet.length; i++) {
		jasenet[i].value = "";
	}
}


/* function luo_jasen_kenttia(lkm)
* -------------------------------------------------------------------
*	lkm		=	Montako jäsenkenttää luodaan lomakkeeseen
* -------------------------------------------------------------------
*	Luo annetun määrän jäsenkenttiä lomakkeeseen.
*/
function luo_jasen_kenttia(lkm) {
	// Haetaan oikea kohta joukkueen lisäämislomakkeesta
	let legendit = document.getElementsByTagName("legend");
	let oikea_legend;
	for (let i = 0; i < legendit.length; i++) {
		if (legendit[i].textContent === "Jäsenet") { // Haku suoritetaan legendin perusteella.
			oikea_legend = legendit[i];
			break;
		}
	}
	// Päivitetään globaaliin muuttujaan jäsen-kentät
	jasenet = [];
	let jasen_container = oikea_legend.parentElement; // Oikea paikka on siis legendin isännän (eli fieldsetin) sisällä
	for (let i = 0; i < lkm; i++) {
		// Luodaan divi, johon luodaan label ja input.
		let container = document.createElement("div");
		container.setAttribute("class","lomake_elementti");
		let lappu = document.createElement("label");
		lappu.setAttribute("for","j"+(i+1));
		lappu.textContent = "Jäsen " + (i+1);
		let input = document.createElement("input");
		input.setAttribute("id","j"+(i+1));
		input.setAttribute("type","text");
		// Muuttuessa katsotaan että jäseniä on vähintään 2.
		input.addEventListener("change", tarkasta_jasenet);
		// Lisätään luotu jäsen input globaaliin muuttujaan ja lisätään input ja label diviin, joka lisätään löydettyyn fieldsettiin.
		jasenet.push(input);
		container.appendChild(lappu);
		container.appendChild(input);
		jasen_container.appendChild(container);
	}
}


/* function luo_joukkueen_sarjat()
* -------------------------------------------------------------------
*	Luo joukkuelomakkeeseen sarjojenvalinta radio-inputit 
*	tietorakenteen perusteella.
*/
function luo_joukkueen_sarjat() {
	// Haetaan oikea paikka spanien perusteella.
	let spanit = document.getElementsByTagName("span");
	let oikea_span;
	for (let i = 0; i < spanit.length; i++) {
		if (spanit[i].textContent === "Sarja") {
			oikea_span = spanit[i];
			break;
		}
	}
	// Etsitään oikea container ja tyhjennetään globaali muuttuja.
	let nappi_container = etsi_seuraava(oikea_span,"DIV");
	sarja = [];
	// Käydään sarjat läpi ja lisäillään ne oikeaan containeriin DIV -> LABEL+INPUT -muodossa.
	for (let i = 0; i < data.sarjat.length; i++) {
		let container = document.createElement("div");
		let lappu = document.createElement("label");
		let nimi = data.sarjat[i].nimi;
		lappu.setAttribute("for",nimi);
		lappu.textContent=nimi;
		container.appendChild(lappu);
		let input = document.createElement("input");
		input.setAttribute("id",nimi);
		input.setAttribute("type","radio");
		input.setAttribute("name","sarja");
		input.setAttribute("value",data.sarjat[i].id);
		sarja.push(input);
		input.addEventListener('click', laske_sarjat);
		container.appendChild(input);
		nappi_container.appendChild(container);
	}
}

/* tarkasta_jasenet()
* -------------------------------------------------------------------
*	Tarkastaa jäsen-tekstikenttien sisällön ja merkitsee ensimmäisen
*	tyhjän kohdalle virheilmoituksen, jos ei ole tarpeeksi jäseniä 
*	syötetty.
*/
function tarkasta_jasenet() {
	// Katsotaan montako jäsentä on täytetty ja etsitään ensimmäinen tyhjä, johon laitetaan sitten tarpeen vaatiessa virheilmoitus.
	let taytettyja = 0;
	let ensimmainen_tyhja = undefined;
	let fs = document.getElementsByTagName("fieldset")[1];
	for (let i = 0; i < jasenet.length; i++) {
		// Tyhjennetään kaikki kentät alkuun virheistä.
		jasenet[i].setCustomValidity("");
		if (jasenet[i].value !== "") {
			taytettyja++;
		} else if (ensimmainen_tyhja === undefined) {
			ensimmainen_tyhja = jasenet[i];
		}
	}
	if (taytettyja<2) {
		fs.setCustomValidity("Jäseniä täytyy olla vähintään 2.");
		fs.reportValidity();
		ensimmainen_tyhja.setCustomValidity("Jäseniä täytyy olla vähintään 2.");
		ensimmainen_tyhja.reportValidity();
	} else {
		fs.setCustomValidity("");
	}
}

/* laske_sarjat()
* -------------------------------------------------------------------
*	Katsoo, onko yhtäkään sarjaa valittu ja ilmoittaa tarvittaessa
*	virheilmoituksella asiasta.
*/
function laske_sarjat() {
	if (data.sarjat.length <= 4) {
		let sarja_pass = false;
		for (let i = 0; i < sarja.length; i++) {
			if (sarja[i].checked) {
				sarja_pass = true;
			}
		}
		if (!sarja_pass) {
			sarja[0].setCustomValidity("Valitse sarja");
			sarja[0].reportValidity();
		} else {
			sarja[0].setCustomValidity("");
		}
	} else { // selectissä ei voi olla tyhjää, joten poistetaan validityvalitukset
		sarja.setCustomValidity("");
	}
}

/* laske_leimaus()
* -------------------------------------------------------------------
*	Laskee, onko vähintään 1 leimaustapa valittuna ja tarvittaessa
*	ilmoittaa siitä virheilmoituksella.
*/
function laske_valitut() {
	let loytyy_valittu = false;
	
	for (var i = 0; i < leimaus.length; i++) {
		if (leimaus[i].checked) {
			loytyy_valittu = true;
		}
	}
	if (!loytyy_valittu) {
		leimaus[0].setCustomValidity("Valitse vähintään 1 leimaustapa!");
		leimaus[0].reportValidity();
	} else {
		leimaus[0].setCustomValidity("");
	}
}

/* tarkasta_luontiaika(e)
* -------------------------------------------------------------------
*	e	=	Vakiotapahtuma
* -------------------------------------------------------------------
*	Tarkastaa, onko lomakkeessa annettu luomisaika suurempi kuin 
*	2017-09-01T01:00. Tarvittaessa ilmoittaa virheilmoituksella asiasta.
*/
function tarkasta_luontiaika(e) {
	let luontiAika = e.target;
	let verrokki = new Date("2017-09-01T01:00");
	let vertailtava = new Date(luontiAika.value);
	if (vertailtava > verrokki) {
		luontiAika.setCustomValidity("Luontiajan oltava pienempi kuin 01:00 1.9.2017");
		luontiAika.reportValidity();
	} else {
		luontiAika.setCustomValidity("");
	}
}

/* tarkasta_joukkueen_nimi(e)
* -------------------------------------------------------------------
*	e	=	Vakiotapahtuma
* -------------------------------------------------------------------
*	Tarkastaa, onko joukkueen nimi uniikki. Tarvittaessa ilmoittaa
*	siitä virheilmoituksella.
*/
function tarkasta_joukkueen_nimi(e) {
	let jNimi = e.target;
	let pass = true;
	for (let i = 0; i < data.joukkueet.length; i++) {
		if (data.joukkueet[i].nimi === jNimi.value) {
			pass = false;
		}
	}
	if (!pass) {
		jNimi.setCustomValidity("Samanniminen joukkue löytyy jo tietokannasta.");
		jNimi.reportValidity();
	} else {
		jNimi.setCustomValidity("");
	}
}



/*	APUFUNKTIOITA
* -------------------------------------------------------------------
*	- lisaa_jalkeen(uusi, vanha)
*	- etsi_seuraava(el, tag)
*/

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