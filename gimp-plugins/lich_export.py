#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
LICH config file export
Peter Chaplin, July 2015

Initially based on info_layers by Robert Brizard
================================================================================
 You may use and distribute this plug-in under the terms of the GPL 2 or greater.
 Get the license text at "http://www.gnu.org/licenses/" 
"""

import gtk, os, json
from gimpfu import *
from gimpshelf import shelf

def traverse(img, layer, path, offset_x, offset_y):
    modes = {
        NORMAL_MODE: "normal",
        MULTIPLY_MODE: "multiply",
        ADDITION_MODE: "lighter",
        SCREEN_MODE: "screen",
        OVERLAY_MODE: "overlay",
        DARKEN_ONLY_MODE: "darken",
        LIGHTEN_ONLY_MODE: "lighten",
        DODGE_MODE: "color-dodge",
        BURN_MODE: "burn",
        HARDLIGHT_MODE: "hard-light",
        SOFTLIGHT_MODE: "soft-light",
        DIFFERENCE_MODE: "difference",
        SUBTRACT_MODE: "exclusion",
        HUE_MODE: "hue",
        SATURATION_MODE: "saturation",
        COLOR_MODE: "color",
        VALUE_MODE: "luminosity"
    }
    config = {}
    source = path + layer.name

    if hasattr(layer,"layers"):
        config["layers"] = []
        for L in reversed(layer.layers):
            config["layers"].append(traverse(img, L, source + "/", layer.offsets[0], layer.offsets[1]))
        config["type"] = "group"
        config["source"] = source
        os.mkdir(source)

    elif layer.mask:
        config["type"] = "group"
        config["source"] = source
        config["layers"] = []
        os.mkdir(source)

        config2 = {}
        config2["type"] = "single"
        config2["source"] = source + "/base.png"
        pdb.gimp_file_save(img, layer, source + "/base.png", source + "/base.png")

        config["layers"].append(config2)

        tmp = pdb.gimp_layer_new_from_drawable(layer.mask, img)
        img.add_layer(tmp,0)
        tmp.add_alpha()
        white = gimpcolor.RGB(1.0, 1.0, 1.0, 1.0)
        pdb.plug_in_colortoalpha(img, tmp, white)

        config3 = {}
        config3["type"] = "single"
        config3["source"] = source + "/mask.png"
        config3["mode"] = "destination-in"
        pdb.gimp_file_save(img, tmp, source + "/mask.png", source + "/mask.png")
        img.remove_layer(tmp)

        config["layers"].append(config3)

    else:
        config["type"] = "single"
        config["source"] = source + ".png"
        pdb.gimp_file_save(img, layer, source + ".png", source + ".png")

    if layer.mode in modes:
        config["mode"] = modes[layer.mode]

    config["offset"] = [
        layer.offsets[0] - offset_x,
        layer.offsets[1] - offset_y
    ]

    return config

def save_file(img, draw) :

    chooser = gtk.FileChooserDialog(title="User file selection",
                                    action=gtk.FILE_CHOOSER_ACTION_SELECT_FOLDER,
                                    buttons=(gtk.STOCK_CANCEL, gtk.RESPONSE_CANCEL,
                                             gtk.STOCK_SAVE, gtk.RESPONSE_OK))
    
    response = chooser.run()
    if response != gtk.RESPONSE_OK:
        chooser.destroy()
        gimp.message("INFO: save was aborted by the user")
        return
        
    folder = chooser.get_filename()
    if folder:
        config = {}
        config["layers"] = []
        for L in reversed(img.layers):
            config["height"] = img.height
            config["width"] = img.width
            config["layers"].append(traverse(img, L, folder + "/", 0, 0))
            
        file_obj = open(folder + "/config.jsonp", "w")
        file_obj.write("var config = " + json.dumps(config, indent=4, separators=(',', ': ')));
        file_obj.close()
            
    else: gimp.message("ERROR: no folder given!")
    
    chooser.destroy()
    return

register(
    'lich_export',
    'Export layers to images and create a LICH config file',
    'Export layers to images and create a LICH config file',
    'Peter Chaplin',
    'Peter Chaplin',
    '2015',
    '<Image>/Extensions/Lich Export',
    '*',
    [],
    [],
    save_file
)

main() 
