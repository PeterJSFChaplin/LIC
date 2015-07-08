var canvas = document.getElementById("canvas");
var sidebar = document.getElementById("sidebar");
var loaded = {};
var allLoaded = false;

if ( typeof config.width !== "undefined" ) {
    canvas.setAttribute('width', config.width);
}
if ( typeof config.height !== "undefined" ) {
    canvas.setAttribute('height', config.height);
}

setup(config.layers);

function setup(layers) {
    layers.forEach(function(layer) {
	if ( (layer.type || "single") == "single" ) {
	    layer.img = new Image();
	    layer.img.addEventListener("load", function() {
		loaded[layer] = true;
		if ( config.layers.every(function(layer) {
		    return (layer.type || "single") != "single" || loaded[layer];
		}) ) {
		    allLoaded = true;
		    draw(config.layers, canvas);
		}
	    }, false);
	    layer.img.src = 'images/' + layer.source.replace('#', '%23');
	}

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

	sidebar.appendChild(control);
	
	if ( layer.type == "group" ) {
	    setup(layer.layers);
	}
    });
}

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

sidebar.addEventListener('change', function() {
    if ( allLoaded ) {
	draw(config.layers, canvas);
    }
});
