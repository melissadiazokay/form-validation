	class FormValidation {

		/*
		List of validation handles:

		required - field is required; cannot be null or empty
		is_email - field must be a valid email address; format of an email, no special characters
		is_alpha - field must be alphabetic; no numbers or special characters
		is_numeric - field must be numeric; no alphabetic or special characters
		minLength={value} - the input data length must be equal to or greater than {value}
		maxLength={value} - the input data length must be equal to or less than {value}
		matchField={field_name} - the input data must match value of field with name {field_name}
		*/

		constructor(data,formElement) {

			this.form = formElement;
			this.data = data;
			this.valiData = {};
			this.errorMessages = {
				'required' : 'is required',
				'is_email' : 'must be a vaild email address',
				'is_alpha' : 'cannot contain numbers or special characters',
				'is_numeric' : 'must be a numeric value',
				'minLength' : 'must be at least %% characters long',
				'maxLength' : 'cannot be longer than %% characters',
				'matchField' : 'must match %% field'
			}
			this.getValidata();
			this.clearErrorClasses();
		}

		clearErrorClasses(){

			document.querySelectorAll('.field-wrap').forEach(function(el){
				if(el.classList.contains('have-error')){
					el.classList.remove('have-error');
				}
			});
		}

		getValidata(){

			for(let i=0; i < this.form.elements.length; i++){
				if(this.form.elements[i].value == 'submit') continue;
				let el = this.form.elements[i].getAttribute('data-validate') || null;
				this.valiData[this.form.elements[i].name] = el ? el.replace(/\s/g,'').split(',') : [];
			}
		}

		validate(){

			// Checks @data object against validation object @valiData
			//
			// @data (object) - an object of key-value pairs representing form submission data
			// @valiData (object) - an object of key-value pairs where the keys are the same as the @data object keys
			// 						and values are arrays of validation handles
			// Return - if successful, returns TRUE. if errors, returns an object where the keys are the same as the @data object keys 
			//          and values are arrays containing the validation rules that failed

			let haveError = false;
			let errors = {}; 
			let isEmail = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
			let charIsLetter = /^[a-zA-Z]+$/;

			for (let k in this.data) {
			  	errors[k] = [];
			  	for (let j in this.valiData[k]) {
				  	switch(this.valiData[k][j]) {
				  		case 'required':
				  			if (this.data[k] === null || this.data[k] == '' || this.data[k].length == 0) {
				  				errors[k].push(this.valiData[k][j]);
				  			}
				  		break;
				  		case 'is_email':
				  			if (!isEmail.test(this.data[k])) {
				  				errors[k].push(this.valiData[k][j]);
				  			}
				  		break;
				  		case 'is_alpha':
				  			if (!charIsLetter.test(this.data[k])) {
				  				errors[k].push(this.valiData[k][j]);
				  			}
				  		break;
				  		case 'is_numeric':
				  			if (isNaN(this.data[k])) {
				  				errors[k].push(this.valiData[k][j]);
				  			}
				  		break;
				  		default: 

				  			// handle minLength
				  			if(this.valiData[k][j].includes('minLength')){

								const arr = this.valiData[k][j].split('=');
								if(arr.length === 2 && !isNaN(arr[1])){
									const minVal = arr[1];
									if(this.data[k].length < arr[1]){
										errors[k].push(this.valiData[k][j]);
									}
								}

							// handle maxLength
				  			} else if(this.valiData[k][j].includes('maxLength')){

								const arr = this.valiData[k][j].split('=');
								if(arr.length === 2 && !isNaN(arr[1])){
									const maxVal = arr[1];
									if(this.data[k].length > arr[1]){
										errors[k].push(this.valiData[k][j]);
									}
								}

							// handle matchField
				  			} else if(this.valiData[k][j].includes('matchField')){

								const arr = this.valiData[k][j].split('=');
								if(arr.length === 2){
									const fieldToMatch = arr[1];
									if(this.data[k] != this.data[fieldToMatch]){
										errors[k].push(this.valiData[k][j]);
									}
								}

				  			} else console.log(`Warning: validation handle "${this.valiData[k][j]}" undefined`);

				  		break;
				  	}
				}	
				if(!haveError) haveError = errors[k].length > 0;	 
			}

			return haveError ? errors : true;
		}

		showErrors(errorsObj){

			for (let name in errorsObj){
				let errorHTML = '';
				let errorField = document.querySelector(`[data-field="${name}"] .field-error`);
				if(errorsObj[name].length !== 0) {
					let errorFieldWrap = document.querySelector(`[data-field="${name}"]`);
					let label = document.querySelector(`[data-field="${name}"] label`);
					errorFieldWrap.classList.add('have-error');
					for (let i in errorsObj[name]){
						let errorMessage = "";
						let handle = errorsObj[name][i];
						if(handle.includes('minLength') || handle.includes('maxLength') || handle.includes('matchField')){
							let handleArr = handle.split('=');
							handle = handleArr[0];
							const handleVal = handleArr[1];
							errorMessage = this.errorMessages[handle].replace('%%',handleVal);
						}
						errorMessage = errorMessage.length > 0 ? errorMessage : this.errorMessages[handle];
						errorHTML += `<div class="field-error-message">${label.innerText}&nbsp;${errorMessage}</div>`;
					}
				}
				errorField.innerHTML = errorHTML;
			}
		}
	}