(function(window){
	'use strict';

	$(document).ready(function(){
		/**
	     * Popup class.
	     * @constructor
	     */
		var Popup = function() {
			this._email = localStorage.getItem('_email') || "";
			this._password = localStorage.getItem('_password') || "";
			this.selectedJournal = null;
			this._accessToken = localStorage.getItem('_accessToken') || "";
			this._journals = JSON.parse(localStorage.getItem("_journals")) || {};
			this._journalName = "";
			this._clipName = "";
			this._colorCode = '0';	//	
			this._accessType = 0;	//	public
			this._clipType = 0;		//	url name and summary text
			this._text = "";		// 	For Text cilp
			this.setActiveTab();
			this.init();
			
			$($('div .save-container')[0]).hide();
			$($('div .select-container')[0]).hide();
			$($('div .login-container')[0]).show();

			if (this._accessToken != "")
				this.showSelectContainer();
			else
				this.showLoginContainer();
		};

		Popup.prototype = {
			/**
			 * Initialize popup
			 */
			init: function() {
				var self = this;
				console.log("The popup was just initialized...");
				$($('input .email')[0]).val(localStorage.getItem('_email') || '');
				$($('input .password')[0]).val(localStorage.getItem('_password') || '');
				$($('.button-container #login-button')[0]).bind('click', this.onLogin);
				$($('.input span .addNewJournal')[0]).bind('click', this.onAddNewJournal);
				$($('.select-container .button-container #select-save-button')[0]).bind('click', this.onSelectSave);
				$($('.save-container .content .save-journal-name-container span h6:last-child')[0]).bind('click', this.showSelectContainer);
				$($('.save-container .button-container #select-save-button')[0]).bind('click', this.onNewTripSave);
				$('div.save-journal-color-pannel > ul.colors > li.color').bind('click', function() {
					$('div.save-journal-color-pannel > ul.colors > li.color.selected').removeClass('selected');
					$(this).addClass('selected');
					self._colorCode = $(this).attr('val');
				});

				$('#save-journal-name').bind('change', function() {
					self._journalName = $(this).val();
				});

				$('#save-clip-name').bind('change', function() {
					self._clipName = $(this).val();
				});

				$($('.select-container input[type=radio][name=clip-type]')).bind('change', function(){
					if ($(this).val() == 'text'){
						$($('.select-container #select .input .clipTypeContainer #clip-type-text-content')[0]).attr('disabled', false);
						self._clipType = TripFlockAPI.clipType.text; // cliptype = Text content
					} else if ($(this).val() == 'url') {
						$($('.select-container #select .input .clipTypeContainer #clip-type-text-content')[0]).attr('disabled', true);
						self._clipType = TripFlockAPI.clipType.urlPageNameAndSummary; // cliptype = url and summary text
					}
					else {
						$($('.select-container #select .input .clipTypeContainer #clip-type-text-content')[0]).attr('disabled', true);
						self._clipType = TripFlockAPI.clipType.screenshot; //// cliptype = screenshot
					}
				});

				$($('.save-container .content .clipType .clipTypeContainer input[type=radio][name=clip-type]')).bind('change', function(){
					if ($(this).val() == 'text'){
						$($('.save-container .content .clipType .clipTypeContainer #save-clip-type-text-content')[0]).attr('disabled', false);//attr('opacity', 1);
						self._clipType = TripFlockAPI.clipType.text; // cliptype = Text content
					} else if ($(this).val() == 'url') {
						$($('.save-container .content .clipType .clipTypeContainer #save-clip-type-text-content')[0]).attr('disabled', true);
						self._clipType = TripFlockAPI.clipType.urlPageNameAndSummary; // cliptype = url and summary text
					}else {
						$($('.save-container .content .clipType .clipTypeContainer #save-clip-type-text-content')[0]).attr('disabled', true);
						self._clipType = TripFlockAPI.clipType.screenshot; //// cliptype = screenshot
					}
				});

				/**
				 *
				 */
				$('div.save-container .save-option-container input[name="clip-access-type"]').bind('change', function() {
					if ($(this).val() == 'private')
						self._accessType = TripFlockAPI.accessType.private;
					else
						self._accessType = TripFlockAPI.accessType.public;
				});

				$('form#save-container .save-journal-access-type #clip-access-type-private').click();
				$('form#save-container .clipTypeContainer #save-clip-type-url').click();
			},

			/**
			 *
			 */
			setActiveTab: function() {
				//
				chrome.runtime.sendMessage({msg: "setActiveTabInfo"}, function(response) {
					console.log(response);
				})
			},

			/**
		     * Showing trip select panel
		     */
			showSelectContainer: function() {
				var self = this;

				TripFlockAPI.getAllJournals(function (data, textStatus, xhr) {
					if (xhr.status == 200) {
						var $selector = $('div#select select#journals'),
							journals = JSON.parse(data);

						$('div#select select#journals option').remove();
						$($('div .login-container')[0]).hide();
						$($('div .save-container')[0]).hide();
						$($('div .select-container')[0]).show();

						for (var i = 0; i < journals.length; i++) {
							$('<option/>',
								{
									'data-id': journals[i].JournalId,
									'data-color-code': journals[i].ColorCode,
									'data-access-type': journals[i].AccessType,
									'data-title':journals[i].Title,
									'data-clip-type':(journals[i].ClipType == undefined) ? TripFlockAPI.clipType.urlPageNameAndSummary : journals[i].ClipType
								})
							.val(journals[i].JournalId)
							.text(journals[i].Title + ((journals[i].AccessType == TripFlockAPI.accessType.private) ? "(private)" : "")).appendTo($selector);
						}

						var firstJournalClipType = $($('.select-container select#journals option')[0]).attr('data-clip-type');
						if (firstJournalClipType == TripFlockAPI.clipType.urlPageNameAndSummary)
							$('#clip-type-url').click();
						else if (firstJournalClipType == TripFlockAPI.clipType.screenshot)
							$('#clip-type-screenshot').click();
						else
							$('#clip-type-text').click();

						$('div#select select#journals').change(function() {
							var value = $(this).val();
							var $selectedOption = $('div#select select#journals option[value="' + value + '"]');
							var curColorCode = $selectedOption.attr('data-color-code'),
								curId = $selectedOption.attr('data-id'),
								curAccessType = $selectedOption.attr('data-access-type'),
								curClipType = $selectedOption.attr('data-clip-type');

							if (curClipType == TripFlockAPI.clipType.urlPageNameAndSummary)
								$('#clip-type-url').click();
							else if (curClipType == TripFlockAPI.clipType.screenshot)
								$('#clip-type-screenshot').click();
							else
								$('#clip-type-text').click();
						});
					} else if (xhr.status == 204) {
						$($('div .login-container')[0]).hide();
						$($('div .save-container')[0]).hide();
						$($('div .select-container')[0]).show();
						$('div#select select#journals option').remove();
					}
					else {
						console.log(textStatus);
						self.showLoginContainer();
					}
				});
			},

			/**
			 *
			 */
			showLoginContainer: function() {
				$($('div .save-container')[0]).hide();
				$($('div .select-container')[0]).hide();
				$($('div .login-container')[0]).show();
			},

			/**
		     * Authentication and lead to select journals
		     * Save email and password into local storage
		     */
			onLogin: function(event) {
				var self = window.Popup;
				event.preventDefault();
				this._email = $($('input').filter('.email')[0]).val();
				this._password = $($('input').filter('.password')[0]).val();
				
				if (this._email != '')
					localStorage.setItem('_email', this._email);

				if (this._password != '')
					localStorage.setItem('_password', this._password);

				var accessToken=""; //here declared accessToken value null

				TripFlockAPI.authenticate(this._email, this._password, function(data, textStatus, xhr) {
					// To do
					if (xhr.status == 200) {
							accessToken = data.accessKey;
							//AccessToken value get  from response.accessKey
							self._accessToken = accessToken;
							localStorage.setItem("_accessToken", accessToken);
							window.Popup.showSelectContainer();
						}
						else {
							console.log(textStatus);
							window.showLoginContainer();
						}
				});
			},

			/**
		     * User is able to go to popup for adding a new journal
		     */
			onAddNewJournal: function() {
				$($('div .login-container')[0]).hide();
				$($('div .select-container')[0]).hide();
				$($('div .save-container')[0]).show();
			},

			/**
		     * Save the selected trip as default trip.
		     */
			onSelectSave: function() {
				var self = window.Popup;
				console.log("You clicked save button in select view. You will add a WebClip for the selected journal.");

				var journalSelectTag = $($('.select-container #select .input #journals')[0]),
					selectedJournalTag = journalSelectTag.find('[value="' + journalSelectTag.val() + '"]');

				if (self.clipType == TripFlockAPI.clipType.screenshot)
				{
					//
				} else {
					if (self._clipType == TripFlockAPI.clipType.text && self._text == "")
					{
						alert("You should enter summary text to add a Summary Text WebClip");
					}
					chrome.runtime.sendMessage({msg: "getCurrentTabInfo"}, function(tab) {
						var journalDatails = { 
												JournalId: parseInt(selectedJournalTag.attr('data-id')),
												ClipType: selectedJournalTag.attr('data-clip-type'),
												Name: tab.title,
												Text: self._text,
												ImageUrl: ""
											};

						TripFlockAPI.addWebClip(journalDatails, function(data, statusText, xhr) {
							console.log(data);
						})
					});
				}

			},

			/**
		     * Save the created trip with info that user filled.
		     */
			onNewTripSave: function() {
				var self = window.Popup,
					journalName = self._journalName,
					journalAccessType = self._accessType,
					journalColorCode = self._colorCode,
					journalClipName = self._clipName,
					journalClipType = self._clipType,
					journalText = self._text,

					journalDatails = { 
										JournalTitle: journalName,
										ColorCode: journalColorCode,
										AccessType : journalAccessType,
										ClipType : journalClipType,
										Name: journalClipName,
										ImageUrl: "",
										Text: journalText
									};
				
				if (journalName == "") {
					console.log("Journal name can't be empty. Please enter the name!");
					return;
				}

				if (journalClipName == "") {
					console.log("Clip Name can't be empty. Please enter the name");
					return;
				}

				if ( journalClipType == TripFlockAPI.clipType.screenshot ) {
					//	In case of screenshot clip type...
					chrome.tabs.captureVisibleTab(null, function(img) {
						var screenshotUrl = img;
					});
				} else if ( journalClipType == 0 ) {
					//	In case of url name and summary text
				} else {
					//	In case of clip text type.
				}

				
				$.ajax({
					beforeSend: function (xhr) {
						xhr.setRequestHeader("accessToken ", self._accessToken);
					},
					type: "POST",
					headers: {
						"accessToken": self._accessToken
					},
					data: JSON.stringify(journalDatails),
					url: "http://api.tripflock.com/api/Journal/Insert",
					contentType: "application/json",
					success: function (response, textStatus, xhr) {
						console.log(textStatus);

						if ( journalClipType == 1 ) {
							//	In case of screenshot clip type...
							chrome.tabs.captureVisibleTab(null, function(img) {
								var screenshotUrl = img;
							});
						} else if ( journalClipType == 0 ) {
							//	In case of url name and summary text
						} else {
							//	In case of clip text type.
						}
					},
					error: function (response) {
						console.log(response.statusText);
					}
				});
			}
		};

		window.Popup = new Popup();
	});
})(window);