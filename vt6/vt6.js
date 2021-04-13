"use strict";

class App extends React.Component {
    constructor(props) {
      super(props);
      this.kisa = data.kisatiedot;
      this.rastit = data.rastit;
      this.state = { 
        "joukkueet" : data.joukkueet
      };
    }
    render () {
      return (<div>
			<ListaaJoukkueet 
				joukkueet={this.state.joukkueet}
			/>
			<LisaaJoukkue />
        </div>);
    }
}
//ListaaJoukkueet
class ListaaJoukkueet extends React.Component {
	render() {
		const joukkueet = [];
		this.props.joukkueet.forEach((joukkue) => {
			joukkueet.push(<ListaaJoukkue 
				jnimi={joukkue.nimi}
			/>);
		});
		return (
		<div className="sisalto">
			<h1>Joukkueet</h1>
			<ul>{joukkueet}</ul>
		</div>
		);
	}
}
class ListaaJoukkue extends React.Component {
	render() {
		const nimi = this.props.jnimi;
		return (<li>{nimi}</li>);
	}
}
//LisaaJoukkue
class LisaaJoukkue extends React.Component {
	render() {
		
		return (
			<form id="joukkue" className="sisalto">
				<h1>Lisää joukkue</h1>
				<fieldset>
					<legend>Joukkueen tiedot</legend>
					<div className="rivi">
						<label className="el_nimi" htmlFor="jNimi">Nimi</label>
						<input className="el_in" type="text" id="jNimi" required/>
					</div>
					<div className="rivi">
						<label htmlFor="luontiAika">Luontiaika</label>
						<input id="luontiAika" type="datetime-local" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}" />
					</div>
				</fieldset>
				<fieldset>
					<legend>Jäsenet</legend>
				</fieldset>
				<button>Tallenna</button>
			</form>
		);
	}
}
ReactDOM.render(
    <App />,
  document.getElementById('root')

);
