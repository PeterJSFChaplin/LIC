'use strict'

var canvas = document.getElementById("canvas");
var sidebar = document.getElementById("sidebar");

if ( typeof config.width !== "undefined" ) {
    canvas.setAttribute('width', config.width);
}
if ( typeof config.height !== "undefined" ) {
    canvas.setAttribute('height', config.height);
}

// Set up options sidebar
function optionsHTML(layers) {
    var ul = document.createElement('ul');
    layers.forEach(function(layer) {
	var li = document.createElement('li');

	var control = document.createElement('p');

	var input = document.createElement('input');
	input.setAttribute('type', "checkbox")
	input.setAttribute('checked', true)
	input.setAttribute('id', layer.source);
	control.appendChild(input)

	var label = document.createElement('label')
	label.setAttribute('for', layer.source)
	label.innerHTML = layer.source;
	control.appendChild(label);
	li.appendChild(control);

	if (layer.type === "group") {
	    li.appendChild(optionsHTML(layer.layers));
	}
	ul.appendChild(li);
    });
    return ul;
}
sidebar.appendChild(optionsHTML(config.layers));

// Load images
function loadImage(layer) {
    return new Promise(
	function(resolve, reject) {
	    var img =  new Image();
	    img.addEventListener("load", function() {
		resolve(img);
	    });
	    img.addEventListener("error", function() {
		reject('Error loading '+ layer.source);
	    });
	    img.src = 'images/' + encodeURIComponent(layer.source);
	    layer.img = img;
	}
    )
}

function loadImages(layers) {
    var loaders = [];
    layers.forEach(function(layer) {
	layer.type = layer.type || 'single';
	if ( layer.type === 'single' ) {
	    loaders.push(
		loadImage(layer)
	    );
	} else {
	    loaders.push(
		loadImages(layer.layers)
	    );
	}
    });
    return Promise.all(loaders);
}

loadImages(config.layers)
.then(function() {
    draw(config.layers, canvas);

    sidebar.addEventListener('change', function() {
	draw(config.layers, canvas);
    });
});

function draw(layers, canvas) {
    var x = canvas.getContext("2d");
    x.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach(function(layer) {
	if ( document.getElementById(layer.source).checked ) {
	    x.globalCompositeOperation = layer.mode || "normal";
	    if ( (layer.type || "single") == "single" ) {
		x.drawImage(
		    layer.img,
		    layer.offset[0],
		    layer.offset[1]
		);
	    } else if ( layer.type == "group" ) {
		var groupCanvas = document.createElement("canvas");
		if ( typeof layer.width !== "undefined" ) {
		    groupCanvas.setAttribute('width', layer.width);
		} else {
		    groupCanvas.setAttribute('width', getWidth(layer.layers));
		}
		if ( typeof layer.height !== "undefined" ) {
		    groupCanvas.setAttribute('height', layer.height);
		} else {
		    groupCanvas.setAttribute('height', getHeight(layer.layers));
		}
		if ( layer.layers ) {
		    draw(layer.layers, groupCanvas);
		}
		x.drawImage(
		    groupCanvas,
		    layer.offset[0],
		    layer.offset[1]
		);
	    }
	}
    });
}

function getWidth(layers) {
    var width = 0
    layers.forEach(function(layer) {
	if ( (layer.type || "single") == "single" ) {
	    width = Math.max(width, layer.img.naturalWidth + layer.offset[0])
	} else {
	    width = Math.max(width, getWidth(layer.layers))
	}
    })
    return width
}

function getHeight(layers) {
    var height = 0
    layers.forEach(function(layer) {
	if ( (layer.type || "single") == "single" ) {
	    height = Math.max(height, layer.img.naturalHeight + layer.offset[1])
	} else {
	    height = Math.max(height, getHeight(layer.layers))
	}
    })
    return height
}
