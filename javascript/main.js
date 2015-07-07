var canvas = document.getElementById("canvas");
var sidebar = document.getElementById("sidebar");
var x = canvas.getContext("2d");
var loaded = false;

setup(config.layers);

function setup(layers) {
    layers.forEach(function(layer) {
	if ( layer.type == "single" ) {
	    layer.img = new Image();
	    layer.img.addEventListener("load", function() {
		layer.loaded = true;
		if ( config.layers.every(function(layer) {
		    return layer.type != "single" || layer.loaded;
		}) ) {
		    loaded = true;
		    canvas.setAttribute('width', config.width);
		    canvas.setAttribute('height', config.height);
		    draw(config.layers);
		}
	    }, false);
	    layer.img.src = 'images/' + layer.source.replace('#', '%23') + '.png';
	}
	
	if ( layer.layers ) {
	    setup(layer.layers);
	}

	sidebar.insertAdjacentHTML(
	    'beforeend',
	    '<p>' +
		'<input type="checkbox" checked id="' +
		layer.source +
		'"><label for="' +
		layer.source +
		'">' +
		layer.source +
		'</label>' +
		'</p>'
	);
    });
}

function draw(layers) {
    layers.forEach(function(layer) {
	if ( document.getElementById(layer.source).checked ) {
	    if ( layer.type == "single" ) {
		x.drawImage(
		    layer.img,
		    layer.offset[0],
		    layer.offset[1]
		);
	    }
	    if ( layer.layers ) {
		draw(layer.layers);
	    }
	}
    });
}

sidebar.addEventListener('change', function() {
    if ( loaded ) {
	draw(config.layers);
    }
});
