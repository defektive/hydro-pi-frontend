var UPCModel = Backbone.Model.extend({
	urlRoot: "/upc/",
	idAttribute: "id",

	defaults: {
		"valid": "true",
		"number": "0",
		"itemname": "Loading...",
		// "description": "http:\/\/upcdatabase.org\/code\/0111222333446",
		"price": 0.00,
		"ratingsup": 0,
		"ratingsdown": 0
	},

	initialize: function (options){
		this.on("sync", function (){
			if(this.get("id") == this.get("number")){
				this.set("id", new Date().getTime());
			}
		});
	}
});

var ShoppingCart = Backbone.Collection.extend({
	model: UPCModel,

	initialize: function(options){
		this.on("add", this.handleAdd);
	},

	timeout: false,
	handleAdd: function (){
		if(this.timeout){
			clearTimeout(this.timeout);
		}

		this.timeout = _.delay(this.emptyCart.bind(this), 10000);
	},

	emptyCart: function(){
		this.reset();
	},

	getTotal: function (){
		// thanks winchester
		return Math.round(this.reduce(function(memo, item){return memo + parseFloat(item.get('price'), 10);},0) *100) / 100;
	}
});

var ShoppingCartView = Backbone.View.extend({

	socket: null, // used for the rfid badge
	initialize: function (options){
		this.listenTo(this.collection, "add", this.addItem);
		this.listenTo(this.collection, "reset", this.handleReset);
		this.listenTo(this.collection, "change", this.handleChange);

		this.socket = io.connect();
		this.listenTo(this.socket, 'id', this.handleCheckout.bind(this));
		this.$el.addClass("empty");
	},

	addItem: function (model){
		this.$el.removeClass("empty");
		var el = $("<div>");
		new UPCView({
			model: model,
			el: el
		}).render();

		this.$(".fm-items").append(el);
	},

	handleChange: function (){
		this.$(".fm-total").text(this.collection.getTotal());
	},

	handleReset: function (){
		this.$(".fm-items").html("");
		this.$el.addClass("empty");
	},

	handleCheckout: function(data){
		console.log(data);
		if(!this.$el.hasClass("empty")){
			this.$(".fm-items").html("<div class='thanks'>Thanks!!!</div>");
		}
	}

});

var UPCView = Backbone.View.extend({
	className: "fm-item",

	initialize: function (options){
		this.listenTo(this.model, "change", this.render);
		this.$el.addClass(this.className);
	},

	render: function (){

		var name = this.model.get("itemname");
		if(!name.length){
			name = this.model.get("description");
		}

		this.$el.html("<span class='fm-item-name'>" + name + "</span><span class='fm-item-price fm-currency'>" + this.model.get("price") + "</span>");
	}
});

var shoppingCart = new ShoppingCart();
var shoppingCartView = new ShoppingCartView({
	el: ".sidebar-nav",
	collection: shoppingCart
});

var code = "",
	timeout = false;

$(window).keypress(function (event){
	code += String.fromCharCode(event.which);
	if(timeout){
		clearTimeout(timeout);
	}

	timeout = setTimeout(handleNewBarcode, 50);
});

var handleNewBarcode = function (){

	var myCode = code.replace(/\s+/g, '');
	code = "";
	timeout = false;

	if(myCode.length){

		var upc = new UPCModel({id: myCode});
		shoppingCart.add(upc);

		upc.fetch();

	}
};


