// Setting global variables

// Test item id: 449038930 (Flower of Life)


var appContainer =  document.querySelector('#app-wrapper')
var inputNode = document.querySelector('#search')

var getSearchTerm = function(eventObj) {
	if (eventObj.keyCode === 13) {
		var userInput = eventObj.target.value
		console.log(userInput)

		location.hash = 'search/' + userInput

	}
}

inputNode.addEventListener('keydown',getSearchTerm)


var EtsyCollection = Backbone.Collection.extend({
	// model: EtsyModel,

	url: 'https://openapi.etsy.com/v2/listings/active.js',

	_key: 'loicqk56ptajxpl0j4omq676',

	parse: function(rawJSON) {
		console.log(rawJSON)
		return rawJSON.results

	}

})


var EtsyModel = Backbone.Model.extend({
	
	el: '#app-wrapper',

	url: function() {
		return 'https://openapi.etsy.com/v2/listings/' + this.listingId + '.js'
	},

	_key: 'loicqk56ptajxpl0j4omq676',	

	parse: function(rawJSON) {
		console.log('etsy model rawJSON results...')
		console.log(rawJSON.results[0])
		return rawJSON.results[0]
	},

	initialize: function(id) {
		this.listingId = id
	}

})

var MultiListView = Backbone.View.extend({
	
	el: '#app-wrapper',

	// Render method calls buildTemplate method for painting all of view's HTML
	_render: function(){
		this.el.innerHTML = this._buildTemplate(this.coll.models)
	},

	_buildTemplate: function(modelsArray){
		var htmlString = ''

		for (var i = 0; i < modelsArray.length; i++ ) {
			var singleModel = modelsArray[i]
			
			htmlString += '<div class="listing">'
			htmlString += 	'<h2>' + singleModel.get('title') + '</h2>'
			htmlString += 	'<img src="' + singleModel.get('Images')[0].url_75x75 + '" />'
			htmlString += 	'<a href="#listing/' + singleModel.get('listing_id') + '" >Click here to view item</a>'
			htmlString += '</div>'
		}

		return htmlString

	},

	initialize: function(theCollection) {
		this.coll = theCollection

	},

})


var SingleView = Backbone.View.extend({
	
	el: '#app-wrapper',

	// Render method calls buildTemplate method for painting all of view's HTML
	_render: function(){
		this.el.innerHTML = this._buildTemplate(this.mod)
	},

	_buildTemplate: function(modelData){

		var htmlString = ''

		htmlString += 	'<h1>' + modelData.get('title') + '</h1>'
		htmlString += 	'<img src="' + modelData.get('Images')[1].url_570xN + '" />'
			
		return htmlString

	},

	initialize: function(theModel) {
		this.mod = theModel

	},

})


var EtsyController = Backbone.Router.extend({
	
	routes: {
		'home':'handleHome',
		'search/:keyword':'handleSearch',
		'listing/:listingId':'handleSingleListing',
		'*default':'redirectHome'
	},

	handleHome: function(){

		console.log('This is the home view')
		
		// Creating new instance of EtsyCollection
		var homeCollection = new EtsyCollection()
	
		// Fetching API url from Constructor and then passing the promise to the Home view
		homeCollection.fetch({
			dataType: 'jsonp',
			data: {
				api_key: homeCollection._key,
	            includes: 'Images,Shop',
	            processData: true,
	            limit: 50,

			}
		}).then(function(){
			
			var homeView = new MultiListView(homeCollection)
			homeView._render()


		})

	},

	handleSearch: function(keyword) {
		appContainer.innerHTML = 'You just searched for something!'

		var searchColl = new EtsyCollection()

		searchColl.fetch({
			dataType: 'jsonp',
			data: {
				api_key: searchColl._key,
	            includes: 'Images,Shop',
	            processData: true,
	            limit: 24,
	            keywords: keyword,
			}
		}).then(function(apiResponse){
			console.log('api response from search:')
			console.log(apiResponse)

			var searchView = new MultiListView(searchColl)
			searchView._render()
		})

		
	},

	handleSingleListing: function(listingId) {
		console.log('This is the listing view!')

		var singleItemColl = new EtsyModel(listingId)

		singleItemColl.fetch({
			dataType: 'jsonp',
			data: {
				api_key: singleItemColl._key,
	            includes: 'Images,Shop',
	            processData: true,

			}
		}).then(function(){
	
			var singleView = new SingleView(singleItemColl)
			singleView._render()
		})

	},

	redirectHome: function() {
		location.hash = 'home'
	},

	initialize: function() {
		Backbone.history.start()
	}


})

var rtr = new EtsyController()