/*
KO Validation:

Common Options:
	- messageID	=> Optional.
				=> A string value that corresponds to a valid 'id' attribute of a DOM element.
				=> Used to define the DOM element that will be shown once the validation fails.

	- groupID	=> Optional.
				=> A string value that corresponds to a valid 'id' attribute of a DOM element.
				=> Used to define a grouped validation message.
				=> If defined, the 'messageID' option will be required.

Validation Types:

validateRange
	Used to validate the range of a given input element. 
	options:
		- type 		=> Optional.
					=> Possible values are 'text' or 'number'.
					=> Defaults to 'text' when not defined.

		- minRange	=> Required when maxRange option is not defined
					=> Where type is equal to 'text', validates the minimum number of characters required for an input element.
					=> Where type is equal to 'number', validates the minimum numeric value of an input element.

		- maxRange	=> Required when minRange option is not defined
					=> Where type is equal to 'text', validates the maximum number of characters required for an input element.
					=> Where type is equal to 'number', validates the maximum numeric value of an input element.

	Usage Example:
		validateRange: {
			type: 'text' || 'number',
			minRange: <numeric-value>,
			maxRange: <numeric-value>
		}

validateRegex
	=> A valid regular expression.
	=> Define multiple regular expressions by using an array.
	=> For multiple regular expressions, order of validation will be the same as the order it was defined.

	Usage Example:
		validateRegex: <regular-expression>
		validateRegex: [<regular-expression>, <regular-expression>]

*/

var Validate = {};

Validate.Exceptions = {
	throwEx: function(exception){
		try{
			throw exception;
		}
		catch(e){
			console.error(e.fnName + ': ' + e.message);
		}
	},

	ValidateRangeException: function(message){
		this.name = 'ValidateRangeException';
		this.fnName = 'validateRange';
		this.message = message;
	},

	ValidateRegexException: function(message){
		this.name = 'ValidateRegexException';
		this.fnName = 'validateRegex';
		this.message = message;
	}
};

Validate.Utils = {
	isArray: function(value){
		if ( value === undefined ){ return false; }

		return ( Object.prototype.toString.call( value ) === '[object Array]' );
	},

	isInt: function(value){
		if ( value === undefined ){ return false; }

		if ( value.length === 0 ){
			return false;
		}

		if ( parseInt(value) === NaN ){
			return false;
		}

		if ( parseInt(value, 10) !== parseFloat(value) ){
			return false;
		}

		if ( typeof value !== 'number' ){
			return false;
		}

		return true;
	},

	isFloat: function(value){
		if ( value === undefined ){ return false; }

		if ( value.length === 0 ){
			return false;
		}

		if ( parseFloat(value) === NaN ){
			return false;
		}

		if ( parseInt(value, 10) === parseFloat(value) ){
			return false;
		}

		if ( typeof value !== 'number' ){
			return false;
		}

		return true;
	},

	isString: function(value){
		if ( value === undefined ){ return false; }

		return ( typeof value === 'string' );
	},

	unitTest: function(){
		var Utils = Validate.Utils;

		var valuesToTest = [
			1, 1.10, 'string', [1, 2, 3]
		]

		var size = valuesToTest.length;

		for ( var i = 0; i < size; i++ ){

			var value = valuesToTest[i];			

			var result = (i + 1) +
						': ' +
						value +
						' (isArray = '+ Utils.isArray(value) + ')' +
						' (isInt = '+ Utils.isInt(value) + ')' +
						' (isFloat = '+ Utils.isFloat(value) + ')' +
						' (isString = '+ Utils.isString(value) + ')';
			
			console.log(result);
		}
	}
};


ko.bindingHandlers.validateRange = {
	validate: function(element, valueAccessor, allBindings, viewModel, bindingContext){
		var utils 		= Validate.Utils;
		var throwEx 	= Validate.Exceptions.throwEx;
		var ex 			= Validate.Exceptions.ValidateRangeException;

        var bindValue 	= ko.unwrap(valueAccessor());
        var allBinds  	= ko.unwrap(allBindings());
        var logError 	= ko.bindingHandlers.validateRange.logError;

        if ( bindValue === undefined ){
        	throwEx( new ex("Missing required parameter for 'validateRange' binding.") );
        	return;
        }

        if ( !utils.isInt(bindValue.minRange) && !utils.isInt(bindValue.maxRange) ){
        	throwEx( new ex("Either 'minRange' and 'maxRange' should be a valid integer value.") );
        	return;
        }

        if ( allBinds.value === undefined ){
        	throwEx( new ex("Missing required 'value' binding.") );
        	return;
        }

        var type = bindValue.type;
        var min = bindValue.minRange;
        var max = bindValue.maxRange;
        var value = ko.unwrap(allBinds.value);


        var valueToValidate = 0;

        switch(type){
        	case 'text':{
				if ( !utils.isString(value) ){
		        	throwEx( new ex("Value for the 'value' binding should be a string.") );
		        	return;
        		}

        		valueToValidate = value.length;

        		break;
        	}
        	case 'number':{
        		var isInt = utils.isInt(value);
        		var isFloat = utils.isFloat(value);

        		if ( !isInt && !isFloat ){
		        	throwEx( new ex("Value for the 'value' binding should be a number.") );
		        	return;
        		}

				valueToValidate = value;

        		break;
        	}
        	default:{
	        	throwEx( new ex("Invalid 'type' value. Possible values are 'text' or 'number'.") );
	        	return;
        	}
        }

        var isValid = true;

		if ( utils.isInt(min) && valueToValidate < min ){ isValid = false; }
		if ( utils.isInt(max) && valueToValidate > max ){ isValid = false; } 

        var messageID = bindValue.messageID;

    	if ( messageID !== undefined ){
    		var msg = document.getElementById(messageID);
    		
    		if ( msg === null ){
    			throwEx( new ex("The DOM element " + messageID + " does not exist."));
    			return;
    		}
    	}

    	msg.style.display = isValid? 'none': 'block';   
    	element.style.borderColor = isValid? 'green': 'red';
	},

	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var bindValue 	= ko.unwrap(valueAccessor());
        var messageID = bindValue.messageID;

    	if ( messageID !== undefined ){
    		var msg = document.getElementById(messageID);
    		
    		if ( msg === null ){
    			Validate.Exceptions.throwEx( 
    				new Validate.Exceptions.ValidateRangeException("The DOM element " + messageID + " does not exist.")
    			); return;
    		}

    		msg.style.display = 'none';
    	}

		element.onchange = function(){
			ko.bindingHandlers.validateRange.validate(element, valueAccessor, allBindings, viewModel, bindingContext);
		}
	}
}

ko.bindingHandlers.validateRegex = {
	validate: function(element, valueAccessor, allBindings, viewModel, bindingContext){

        var bindValue = valueAccessor();
        if (typeof bindValue === 'string'){
        	//console.log(bindValue + ' is a string.');
        }
        else{
        	//console.log(bindValue + ' is an array.');
        }
	},

	init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		var bindValue 	= ko.unwrap(valueAccessor());
        var messageID = bindValue.messageID;

    	if ( messageID !== undefined ){
    		var msg = document.getElementById(messageID);
    		
    		if ( msg === null ){
    			Validate.Exceptions.throwEx(
    				new Validate.Exceptions.ValidateRegexException("The DOM element " + messageID + " does not exist.")
    			); return;
    		}

    		msg.style.display = 'none';
    	}

		element.onchange = function(){
			ko.bindingHandlers.validateRegex.validate(element, valueAccessor, allBindings, viewModel, bindingContext);
		}
    }
}
