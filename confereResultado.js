var app = {
	model: null,
	view : null,
	controller : null,
	initialize : function (){
		this.view.initialize();
		this.model.initialize.call( this.model );
	}
};
app.model = {
	initialize : function (){
		this.validation.fillErrorLabelsWithRoleValues();
	},
	apostas : {
		data : [],
		add : function ( value ){ this.data.push( value ); },
		last : function (){ return this.data[ this.data.length-1 ];}
	},
	validation : {
		ROLES : {
			MINIMUM_OF_NUMBER_IN_JOGO: 6,
			MINIMUM_VALUE_OF_NUMBER: 0,
			MAXIMUM_VALUE_OF_NUMBER: 60,
		},
		isValid : function ( textoNumeros ){
			var i, ii, numero, vetorNumeros;
			if ( !textoNumeros ){
				return 0.400;
			}
			vetorNumeros = textoNumeros.split(',');
			for ( var i = 0, ii = vetorNumeros.length; i < ii; i++ ){
				numero = vetorNumeros[ i ];
				if ( isNaN( numero ) || numero === '' ){
					return 0.402;
				}
				numero = new Number( vetorNumeros[ i ] );
				if ( !( numero > this.ROLES.MINIMUM_VALUE_OF_NUMBER && numero <= this.ROLES.MAXIMUM_VALUE_OF_NUMBER ) ){
					return 0.403;
				}
				vetorNumeros[ i ] = numero;
			}
			if ( vetorNumeros.length < this.ROLES.MINIMUM_OF_NUMBER_IN_JOGO ){
				return 0.401;
			}
			return 1;
		},
		ERRORS: {
			0.400 : 'Preencha os números da aposta separados por \',\' (vígula).',
			0.401 : 'Número mínimo de números num jogo é #{value}.',
			0.402 : 'Um dos valores informados não é um número.',
			0.403 : 'Valor fora do intervalo permitido.\nEntre número entre #{valueMin} e #{valueMax}.'
		},
		fillErrorLabelsWithRoleValues : function (){
			var erros, error;
			errors = this.ERRORS;
			errors[ 0.401 ] = errors[ 0.401 ].replace( '#{value}', this.ROLES.MINIMUM_OF_NUMBER_IN_JOGO );
			errors[ 0.403 ] = errors[ 0.403 ]
				.replace( '#{valueMin}', this.ROLES.MINIMUM_VALUE_OF_NUMBER )
				.replace( '#{valueMax}', this.ROLES.MAXIMUM_VALUE_OF_NUMBER );
		}
	},
	sorteios : []
}

app.view = {
	initialize : function (){
		this.introduceElements();
		this.jogosDoUsuario.elements.$buttonAdd.click( app.controller.addApostaIfValid );
		this.jogosDoUsuario.elements.$buttonSee.click( function (){
			var sorteio = app.controller.sorteio;
			sorteio.show.call( sorteio );
		});
	},
	introduceElements : function (){
		var elements = this.jogosDoUsuario.elements;
		elements.$buttonAdd = $('#addJogo');
		elements.$buttonSee = $('#mostraNumerosSorteados');
		elements.$lista = $('#meusJogos');
		elements.$textoNovoJogo = $('#numerosDeUmJogo');
	},
	jogosDoUsuario : {
		elements : {
			$lista : null,
			$textoNovoJogo: null,
			$buttonAdd : null,
			$buttonSee : null
		},
		add : function ( numeros ){
			this.elements.$lista.append('<li><ul><li>'+ numeros.join('</li><li>') +'</li></ul></li>');
		}
	}
}
app.controller = {
	addApostaIfValid : function ( value ){
		var view_JogosDoUsuario = app.view.jogosDoUsuario,
			model_apostas = app.model.apostas,
			validation = app.model.validation,
			$textoNovoJogo = view_JogosDoUsuario.elements.$textoNovoJogo,
			textAposta = $textoNovoJogo.val(),
			validationResult = validation.isValid( textAposta ),
			isApostaValid = ( validationResult === 1 );
		if ( isApostaValid ){
			model_apostas.add(  textAposta.split(',') );
			view_JogosDoUsuario.add( model_apostas.last() );
		} else {
			for ( var error in validation.ERRORS ){
				if ( error == validationResult ){
					alert( validation.ERRORS[ error ] );
					break;
				}
			}
		}
	},
	sorteio: {
		gettedLast : null,
		getLast : function ( executeOnSuccess ){
			if ( !this.gettedLast ){
				$.get( 'http://www1.caixa.gov.br/loterias/loterias/megasena/megasena_pesquisa_new.asp?f_megasena=' )
					.success( function ( result ){
						this.gettedLast = true;
						console.log( result );
						if ( executeOnSuccess ){
							executeOnSuccess();
						}
					})
					.error( function ( error ){
						alert( error );
					});
			}
		},
		show : function (){
			if ( !this.gettedLast ){
				this.getLast( this.showSorteioMessage );
			} else {
				this.showSorteioMessage();
			}
		},
		showSorteioMessage : function (){
			alert( app.model.sorteios[ this.gettedLast ] );
		}
	}
}
$( document ).ready( function (){
	app.initialize();
});