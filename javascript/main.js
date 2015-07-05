var canvas = document.getElementById("canvas");
var sidebar = document.getElementById("sidebar");
var x = canvas.getContext("2d");
var loaded = false;

config.layers.forEach(function(layer) {
    layer.img = new Image();
    layer.img.addEventListener("load", function() {
	layer.loaded = true;
	if ( config.layers.every(function(layer) {
	    return layer.loaded;
	}) ) {
	    loaded = true;
	    draw();
	}
    }, false);
    layer.img.src = 'images/' + layer.source;

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

function draw() {
    canvas.setAttribute('width', config.width);
    canvas.setAttribute('height', config.height);

    config.layers.forEach(function(layer) {
	if ( document.getElementById(layer.source).checked ) {
	    x.drawImage(
		layer.img,
		layer.offset[0],
		layer.offset[1]
	    );
	}
    });
}

sidebar.addEventListener('change', function() {
    if ( loaded ) {
	draw();
    }
});
