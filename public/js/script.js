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

var SidebarView = Backbone.View.extend({

	initialize: function (options){
		this.listenTo(this.collection, 'add', this.handleAdd);
	},

	handleAdd: function (model){
		if(model.get('available') !== false){
			var el = $("<li>");
			this.$el.append(el);

			new SidebarStationView({
				model: model,
				el: el
			}).render();
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

	var AllStations = new StationCollection();
	new SidebarView({
		collection: AllStations,
		el: sidebar
	});

	AllStations.fetch();
}
});