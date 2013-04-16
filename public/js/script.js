var StationModel = Backbone.Model.extend({
	idAttribute: "_id",
	urlRoot: "/api/stations/",

	defaults: {
		"number": 0,
		"name": "[Please name me]",
		"region": "Front Yard",
		"status":  false,
		"active": false
	}
});

var StationCollection = Backbone.Collection.extend({
	model: StationModel,
	url: "/api/stations/"
});

var Region = StationCollection.extend({

});

var RegionView = Backbone.View.extend({
	initialize: function (options){
		this.listenTo(this.collection, "add", this.handleStationAdd);

		this.$el.addClass("nav");
		this.$el.addClass("nav-list");
		this.template = _.template($("#sidebar-region").html());
	},

	render: function (){
		this.$el.html(this.template({region: this.options.region}));
		return this;
	},

	handleStationAdd: function (model){

		var el = $("<li>");
		this.$el.append(el);

		new SidebarStationView({
			model: model,
			el: el
		}).render();
	}
});

var SidebarView = Backbone.View.extend({

	initialize: function (options){
		this.regions = {};


		this.collection.fetch({
			success: this.fetchSuccess.bind(this)
		});
	},

	fetchSuccess: function (){
		var mLen = this.collection.length;

		while(mLen--){
			var model = this.collection.at(mLen);
			if(model.get('available') !== false){
				var region = model.get('region');
				if(!this.regions[region]){
					this.regions[region] = new Region();
					var el = $("ul");

					this.$el.append(el);
					new RegionView({
						el: el,
						collection: this.regions[region],
						region: region
					}).render();
				}

				this.regions[region].add(model);
			}
		}
	}
});

var SidebarStationView = Backbone.View.extend({

	events:{
		"click .btn": "handleClick"
	},

	initialize: function (options){
		this.template = _.template($("#sidebar-station").html());
	},

	render: function (){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	handleClick: function (event){
		var target = $(event.target);
			this.model.set('status', target.hasClass("ss-on"));
			this.model.save();
	}
});

$().ready(function (){

	var sidebar = $("#sidebar");
	if(sidebar){

		var allStations = new StationCollection();
		new SidebarView({
			collection: allStations,
			el: sidebar
		});
	}
});